
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
      
      // Buscar TODAS as respostas para esta auditoria
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
      
      // Mapeamento de perguntaId -> respostaId mais recente
      const ultimasRespostasPorPergunta = new Map<string, any>();
      
      // Ordenar as respostas para garantir que pegamos as mais recentes
      // Como estamos usando o created_at, podemos ordenar pelo timestamp
      const respostasOrdenadas = [...respostasData].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Selecionar apenas a resposta mais recente para cada pergunta
      respostasOrdenadas.forEach(resposta => {
        const perguntaId = resposta.pergunta_id;
        if (!ultimasRespostasPorPergunta.has(perguntaId)) {
          ultimasRespostasPorPergunta.set(perguntaId, resposta);
        }
      });
      
      console.log(`Usando ${ultimasRespostasPorPergunta.size} respostas únicas (mais recentes) para cálculo`);
      
      // Agora calcular as pontuações totais por seção usando apenas as respostas mais recentes
      ultimasRespostasPorPergunta.forEach((resposta) => {
        const perguntaId = resposta.pergunta_id;
        const secaoId = perguntaPorSecao[perguntaId];
        
        if (secaoId) {
          // Adicionar pontuação à seção correspondente
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            // Garantir que a pontuação seja tratada como número
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Adicionando pontuação ${pontuacao} para pergunta ${perguntaId} na seção ${secaoId}, novo total: ${scores[secaoId]}`);
          } 
          // Caso não tenha pontuação salva, calcular com base na resposta
          else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] !== undefined ? pontuacaoMap[resposta.resposta] : 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`Calculando pontuação ${pontuacao} para resposta "${resposta.resposta}" na seção ${secaoId}, novo total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Pontuações finais calculadas por seção:", scores);
      setPontuacaoPorSecao(scores);
      
      // Atualizar pontuação total da auditoria
      await updateAuditoriaPontuacaoTotal(auditoriaId, ultimasRespostasPorPergunta);
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
  
  /**
   * Atualiza a pontuação total da auditoria baseada nas respostas mais recentes
   */
  const updateAuditoriaPontuacaoTotal = async (auditoriaId: string, ultimasRespostas: Map<string, any>) => {
    try {
      // Calcular pontuação total somando apenas as respostas únicas mais recentes
      let pontuacaoTotal = 0;
      
      ultimasRespostas.forEach(resposta => {
        if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
          // Garantir que a pontuação seja tratada como número
          pontuacaoTotal += Number(resposta.pontuacao_obtida);
        } else if (resposta.resposta) {
          // Caso não tenha pontuação_obtida, calcular com base na resposta
          const pontuacao = pontuacaoMap[resposta.resposta] !== undefined ? pontuacaoMap[resposta.resposta] : 0;
          pontuacaoTotal += pontuacao;
        }
      });
      
      console.log(`Atualizando pontuacao_total da auditoria ${auditoriaId}: ${pontuacaoTotal} (de ${ultimasRespostas.size} respostas únicas)`);
      
      const { error } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar pontuação total da auditoria:", error);
    }
  };

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao
  };
};
