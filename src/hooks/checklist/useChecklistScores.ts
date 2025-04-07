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
      
      // Now calculate the actual scores from responses
      respostasData.forEach(resposta => {
        const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.secao_id) {
          const secaoId = pergunta.secao_id;
          
          // Use the actual score from the response if available
          // Otherwise calculate it from the response value using pontuacaoMap
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            scores[secaoId] = (scores[secaoId] || 0) + resposta.pontuacao_obtida;
          } else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
          }
        }
      });
      
      console.log("Updated section scores:", scores);
      setPontuacaoPorSecao(scores);
      
      return;
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
