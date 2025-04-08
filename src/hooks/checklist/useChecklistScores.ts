
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
    if (!auditoriaId || !setPontuacaoPorSecao) {
      console.log("Não é possível atualizar pontuações sem auditoriaId ou setPontuacaoPorSecao");
      return;
    }
    
    try {
      console.log("Atualizando pontuações de seção para auditoria:", auditoriaId);
      
      // Buscar TODAS as respostas para esta auditoria
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId)
        .order('created_at', { ascending: false });
        
      if (respostasError) {
        console.error("Erro ao buscar respostas:", respostasError);
        throw respostasError;
      }

      console.log(`Encontradas ${respostasData?.length || 0} respostas para esta auditoria`);

      // Buscar TODAS as perguntas para mapear para seções
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) {
        console.error("Erro ao buscar perguntas:", perguntasError);
        throw perguntasError;
      }
      
      console.log(`Encontradas ${perguntasData?.length || 0} perguntas totais`);
      
      // Calcular pontuações por seção
      const scores: Record<string, number> = {};
      
      // Primeiro, inicializar todas as seções para 0
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });

      // Mapear perguntas para suas seções para acesso mais rápido
      const perguntaPorSecao = perguntasData.reduce((acc, pergunta) => {
        if (pergunta.secao_id) {
          acc[pergunta.id] = pergunta.secao_id;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Criar um mapa das respostas mais recentes para cada pergunta
      const ultimasRespostas = new Map();
      
      // Processar respostas e ficar apenas com a última para cada pergunta
      respostasData.forEach(resposta => {
        // Se já temos uma resposta para esta pergunta, verificar se esta é mais recente
        if (!ultimasRespostas.has(resposta.pergunta_id)) {
          ultimasRespostas.set(resposta.pergunta_id, resposta);
        }
      });
      
      console.log(`Usando ${ultimasRespostas.size} respostas únicas para cálculo`);
      
      // Agora calcular as pontuações totais por seção
      ultimasRespostas.forEach((resposta) => {
        const perguntaId = resposta.pergunta_id;
        const secaoId = perguntaPorSecao[perguntaId];
        
        if (secaoId) {
          // Adicionar pontuação à seção correspondente
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
          } 
          // Caso não tenha pontuação salva, calcular com base na resposta
          else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
          }
        }
      });
      
      console.log("Pontuações finais calculadas por seção:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Erro ao atualizar pontuações de seção:", error);
      throw error;
    }
  };

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao
  };
};
