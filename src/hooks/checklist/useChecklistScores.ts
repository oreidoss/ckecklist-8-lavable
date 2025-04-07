import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage section scores in the checklist
 */
export const useChecklistScores = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Record mapping response values to numeric scores
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  /**
   * Updates section scores based on existing responses
   */
  const updatePontuacaoPorSecao = async () => {
    if (!auditoriaId || !setPontuacaoPorSecao) return;
    
    try {
      console.log("Updating section scores for auditoria:", auditoriaId);
      
      // Fetch all responses
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;

      // Fetch all perguntas to map them to secoes
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      
      // Calculate scores by section
      const scores: Record<string, number> = {};
      
      // First, initialize all secoes to 0
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });

      console.log(`Found ${respostasData.length} respostas to process`);
      
      // Now calculate the actual scores from responses
      respostasData.forEach(resposta => {
        const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.secao_id) {
          const secaoId = pergunta.secao_id;
          
          // Log the data we're working with for debugging
          console.log(`Processing resposta for pergunta ${resposta.pergunta_id} in secao ${secaoId}:`, {
            resposta: resposta.resposta,
            pontuacao_obtida: resposta.pontuacao_obtida
          });
          
          // Use the actual score from the response if available
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Added pontuacao_obtida ${pontuacao} to secao ${secaoId}, new total: ${scores[secaoId]}`);
          } 
          // Otherwise calculate it from the response value using pontuacaoMap
          else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Calculated pontuacao ${pontuacao} from resposta "${resposta.resposta}" for secao ${secaoId}, new total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Final calculated section scores:", scores);
      setPontuacaoPorSecao(scores);
      
      return scores;
    } catch (error) {
      console.error("Error updating section scores:", error);
      return null;
    }
  };

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao
  };
};
