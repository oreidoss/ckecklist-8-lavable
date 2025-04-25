
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePontuacao } from './usePontuacao';

/**
 * Hook para cálculo de pontuações do checklist
 */
export const useChecklistScores = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { pontuacaoMap } = usePontuacao();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Função para atualizar pontuações por seção
   */
  const updatePontuacaoPorSecao = useCallback(async () => {
    if (!auditoriaId) {
      console.error("ID da auditoria não fornecido para atualização de pontuações");
      return Promise.reject("ID da auditoria não fornecido");
    }
    
    if (!setPontuacaoPorSecao) {
      console.log("setPontuacaoPorSecao não fornecido, ignorando atualização de pontuações");
      return Promise.resolve();
    }
    
    console.log("Atualizando pontuações por seção para auditoria:", auditoriaId);
    setIsUpdating(true);
    
    try {
      // Obter todas as respostas únicas (mais recentes) para cada pergunta
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('*, pergunta:perguntas(secao_id)')
        .eq('auditoria_id', auditoriaId);
        
      if (fetchError) {
        console.error("Erro ao buscar respostas para cálculo de pontuações:", fetchError);
        throw fetchError;
      }
      
      if (!respostas?.length) {
        console.log("Nenhuma resposta encontrada para cálculo de pontuações");
        return Promise.resolve();
      }
      
      console.log(`Encontradas ${respostas.length} respostas para cálculo de pontuações`);
      
      // Agrupar respostas por seção
      const respostasPorSecao: Record<string, any[]> = {};
      
      // Pegar apenas a resposta mais recente para cada pergunta
      const perguntasMap = new Map();
      
      // Ordenar respostas por data (mais recentes primeiro)
      const respostasOrdenadas = [...respostas].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Agrupar por seção, mantendo apenas a resposta mais recente para cada pergunta
      respostasOrdenadas.forEach(resposta => {
        // Ignorar se não tiver pergunta ou secao_id
        if (!resposta.pergunta || !resposta.pergunta.secao_id) {
          return;
        }
        
        const secaoId = resposta.pergunta.secao_id;
        const perguntaId = resposta.pergunta_id;
        
        // Se ainda não processamos esta pergunta
        if (!perguntasMap.has(perguntaId)) {
          // Inicializar array da seção se necessário
          if (!respostasPorSecao[secaoId]) {
            respostasPorSecao[secaoId] = [];
          }
          
          // Adicionar resposta ao array da seção
          respostasPorSecao[secaoId].push(resposta);
          
          // Marcar pergunta como processada
          perguntasMap.set(perguntaId, true);
        }
      });
      
      // Calcular pontuações por seção
      const pontuacoes: Record<string, number> = {};
      
      Object.entries(respostasPorSecao).forEach(([secaoId, respostasSecao]) => {
        let pontuacaoSecao = 0;
        
        respostasSecao.forEach(resposta => {
          // Se tiver pontuação calculada
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            pontuacaoSecao += Number(resposta.pontuacao_obtida);
          }
          // Senão, calcular baseado no tipo de resposta
          else if (resposta.resposta && pontuacaoMap[resposta.resposta] !== undefined) {
            pontuacaoSecao += pontuacaoMap[resposta.resposta];
          }
        });
        
        // Arredondar para uma casa decimal
        pontuacoes[secaoId] = Math.round(pontuacaoSecao * 10) / 10;
      });
      
      console.log("Pontuações calculadas por seção:", pontuacoes);
      
      // Atualizar estado de pontuações
      setPontuacaoPorSecao(pontuacoes);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao calcular pontuações por seção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as pontuações das seções.",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsUpdating(false);
    }
  }, [auditoriaId, setPontuacaoPorSecao, toast, pontuacaoMap]);

  return {
    pontuacaoMap,
    updatePontuacaoPorSecao,
    isUpdating
  };
};
