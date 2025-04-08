
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para gerenciar pontuações de seções no checklist
 */
export const useChecklistScores = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Mapeamento de valores de resposta para pontuações numéricas
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  /**
   * Atualiza pontuações de seções baseado nas respostas existentes
   */
  const updatePontuacaoPorSecao = async (): Promise<void> => {
    if (!auditoriaId || !setPontuacaoPorSecao) return;
    
    try {
      console.log("Atualizando pontuações de seção para auditoria:", auditoriaId);
      
      // Buscar TODAS as respostas para esta auditoria
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;

      // Buscar TODAS as perguntas para mapear para seções
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      
      // Calcular pontuações por seção
      const scores: Record<string, number> = {};
      
      // Primeiro, inicializar todas as seções para 0
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });

      console.log(`Encontradas ${respostasData.length} respostas para processar`);
      
      // Mapear perguntas para suas seções para acesso mais rápido
      const perguntaPorSecao = perguntasData.reduce((acc, pergunta) => {
        if (pergunta.secao_id) {
          if (!acc[pergunta.id]) {
            acc[pergunta.id] = pergunta.secao_id;
          }
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Processar apenas as respostas atuais
      const respostasProcessadas = new Set<string>();
      
      // Agora calcular as pontuações reais a partir das respostas
      respostasData.forEach(resposta => {
        const perguntaId = resposta.pergunta_id;
        const secaoId = perguntaPorSecao[perguntaId];
        
        if (secaoId) {
          // Registrar que processamos esta resposta
          respostasProcessadas.add(perguntaId);
          
          // Usar a pontuação real da resposta se disponível
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Adicionada pontuacao_obtida ${pontuacao} à seção ${secaoId}, novo total: ${scores[secaoId]}`);
          } 
          // Caso contrário calcular a partir do valor da resposta usando pontuacaoMap
          else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Calculada pontuação ${pontuacao} da resposta "${resposta.resposta}" para seção ${secaoId}, novo total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Pontuações finais calculadas por seção:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Erro ao atualizar pontuações de seção:", error);
    }
  };

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao
  };
};
