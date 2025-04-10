
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar pontuações de seções do checklist
 */
export const useChecklistScores = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Mapeamento de valores de resposta para pontuações numéricas
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  // Função para calcular e atualizar pontuações
  const updatePontuacaoPorSecao = useCallback(async () => {
    if (!auditoriaId) {
      console.log("Nenhum auditoriaId fornecido, não é possível atualizar pontuações");
      return;
    }
    
    console.log("Atualizando pontuações de seção para auditoria:", auditoriaId);
    setIsUpdating(true);
    
    try {
      // Buscar todas as respostas, perguntas e seções necessárias para o cálculo
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId)
        .order('created_at', { ascending: false });
        
      if (respostasError) throw respostasError;
      
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      
      const { data: secoesData, error: secoesError } = await supabase
        .from('secoes')
        .select('*');
        
      if (secoesError) throw secoesError;
      
      console.log(`Encontradas ${respostasData?.length || 0} respostas, ${perguntasData?.length || 0} perguntas, e ${secoesData?.length || 0} seções`);
      
      // Inicializar pontuações para todas as seções
      const scores: Record<string, number> = {};
      secoesData.forEach((secao: any) => {
        scores[secao.id] = 0;
      });
      
      // Mapa para rastrear perguntas por seção
      const perguntaPorSecao = perguntasData.reduce((acc: Record<string, string>, pergunta: any) => {
        acc[pergunta.id] = pergunta.secao_id;
        return acc;
      }, {});
      
      // Pegar apenas a resposta mais recente para cada pergunta
      const ultimasRespostas = new Map<string, any>();
      
      // Ordenar respostas por data, mais recentes primeiro
      const respostasOrdenadas = [...respostasData].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      respostasOrdenadas.forEach((resposta: any) => {
        if (!ultimasRespostas.has(resposta.pergunta_id)) {
          ultimasRespostas.set(resposta.pergunta_id, resposta);
        }
      });
      
      console.log(`Usando ${ultimasRespostas.size} respostas únicas de ${respostasData.length} totais`);
      
      // Calcular pontuação para cada seção
      ultimasRespostas.forEach((resposta: any) => {
        const secaoId = perguntaPorSecao[resposta.pergunta_id];
        if (secaoId) {
          // Usar pontuacao_obtida se disponível, caso contrário calcular a partir da resposta
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
          } else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] !== undefined ? pontuacaoMap[resposta.resposta] : 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
          }
        }
      });
      
      console.log("Pontuações finais calculadas:", scores);
      
      // Atualizar estado global de pontuações por seção
      if (setPontuacaoPorSecao) {
        console.log("Atualizando pontuações por seção no estado:", scores);
        setPontuacaoPorSecao(scores);
      }
      
      // Calcular pontuação total para a auditoria
      let pontuacaoTotal = 0;
      Object.values(scores).forEach(pontuacao => {
        pontuacaoTotal += pontuacao;
      });
      
      // Atualizar a auditoria com a nova pontuação total
      const { error: updateError } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (updateError) {
        throw updateError;
      }
      
      console.log(`Pontuação total atualizada para auditoria ${auditoriaId}: ${pontuacaoTotal}`);
      
    } catch (error) {
      console.error("Erro ao calcular pontuações por seção:", error);
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [auditoriaId, setPontuacaoPorSecao, pontuacaoMap, toast]);
  
  // Calcular pontuações iniciais quando o componente monta
  useEffect(() => {
    if (auditoriaId) {
      updatePontuacaoPorSecao();
    }
  }, [auditoriaId, updatePontuacaoPorSecao]);

  return { pontuacaoMap, updatePontuacaoPorSecao, isUpdating };
};
