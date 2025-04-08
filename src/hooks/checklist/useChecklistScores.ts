
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar pontuações de seções no checklist
 */
export const useChecklistScores = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  
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
      
      // Buscar TODAS as respostas para esta auditoria sem orderBy (created_at não existe)
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
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
      
      // Criar um mapa das respostas - usamos o último ID como indicador da resposta mais recente
      const ultimasRespostaPorPergunta = new Map();
      
      // Como não temos created_at, vamos usar o ID como indicador da ordem
      // assumindo que IDs maiores são criados mais recentemente
      respostasData.forEach(resposta => {
        const perguntaId = resposta.pergunta_id;
        // Se ainda não temos uma resposta para esta pergunta ou se o ID é maior, atualizar
        if (!ultimasRespostaPorPergunta.has(perguntaId) || 
            resposta.id > ultimasRespostaPorPergunta.get(perguntaId).id) {
          ultimasRespostaPorPergunta.set(perguntaId, resposta);
        }
      });
      
      console.log(`Usando ${ultimasRespostaPorPergunta.size} respostas únicas para cálculo`);
      
      // Agora calcular as pontuações totais por seção
      ultimasRespostaPorPergunta.forEach((resposta) => {
        const perguntaId = resposta.pergunta_id;
        const secaoId = perguntaPorSecao[perguntaId];
        
        if (secaoId) {
          // Adicionar pontuação à seção correspondente
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Adicionando pontuação ${pontuacao} para pergunta ${perguntaId} na seção ${secaoId}`);
          } 
          // Caso não tenha pontuação salva, calcular com base na resposta
          else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Calculando pontuação ${pontuacao} para resposta "${resposta.resposta}" na seção ${secaoId}`);
          }
        }
      });
      
      console.log("Pontuações finais calculadas por seção:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Erro ao atualizar pontuações de seção:", error);
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao atualizar as pontuações das seções.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao
  };
};
