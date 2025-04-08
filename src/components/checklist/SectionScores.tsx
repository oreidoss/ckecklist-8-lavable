
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SectionScoresProps {
  auditoriaId?: string;
  secoes?: any[];
  respostasExistentes?: any[];
  setPontuacaoPorSecao: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const SectionScores: React.FC<SectionScoresProps> = ({
  auditoriaId,
  secoes,
  respostasExistentes,
  setPontuacaoPorSecao
}) => {
  const { toast } = useToast();

  // Calcular e atualizar pontuações das seções
  const updateSectionScores = async () => {
    if (!auditoriaId) {
      console.log("Nenhum auditoriaId fornecido, não é possível atualizar pontuações");
      return;
    }
    
    console.log("Atualizando pontuações de seção para auditoria:", auditoriaId);
    
    try {
      // Consulta direta ao Supabase para cálculo mais preciso de pontuação
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;
      console.log(`Encontradas ${respostasData?.length || 0} respostas para esta auditoria`);

      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      console.log(`Encontradas ${perguntasData?.length || 0} perguntas no total`);
      
      // Calcular pontuações diretamente
      const scores: Record<string, number> = {};
      
      // Inicializar todas as pontuações de seção em 0
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });
      
      // Mapeamento direto de pontuação
      const pontuacaoMap: Record<string, number> = {
        'Sim': 1,
        'Não': -1,
        'Regular': 0.5,
        'N/A': 0
      };
      
      // Criar um mapa de pergunta -> seção para acesso mais rápido
      const perguntaPorSecao = perguntasData.reduce((acc, pergunta) => {
        if (pergunta.secao_id) {
          acc[pergunta.id] = pergunta.secao_id;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Mapear respostas por ID da pergunta para que apenas a resposta mais recente seja considerada
      const ultimasRespostas = new Map();
      
      // Garantir que estamos processando apenas a última resposta para cada pergunta
      respostasData.forEach(resposta => {
        // Para cada pergunta, guardar apenas a resposta mais recente
        // (assumindo que estamos processando na ordem correta)
        ultimasRespostas.set(resposta.pergunta_id, resposta);
      });
      
      console.log(`Usando ${ultimasRespostas.size} respostas únicas das ${respostasData.length} totais`);
      
      // Agora processar apenas as respostas mais recentes
      ultimasRespostas.forEach((resposta) => {
        const secaoId = perguntaPorSecao[resposta.pergunta_id];
        if (secaoId) {
          // Obter nome da seção para melhor logging
          const secao = secoes?.find(s => s.id === secaoId);
          const secaoNome = secao ? secao.nome : 'seção desconhecida';
          
          // Usar pontuacao_obtida se disponível, caso contrário calcular a partir da resposta
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Adicionada pontuacao_obtida ${pontuacao} à seção "${secaoNome}", novo total: ${scores[secaoId]}`);
          } else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Calculada pontuação ${pontuacao} da resposta "${resposta.resposta}" para seção "${secaoNome}", novo total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Pontuações finais calculadas:", scores);
      setPontuacaoPorSecao(scores);
      
      // Atualizar pontuação total da auditoria
      await updateAuditoriaPontuacaoTotal(auditoriaId, ultimasRespostas);
      
    } catch (error) {
      console.error("Erro ao calcular pontuações diretamente:", error);
      
      // Mostrar toast de erro
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    }
  };
  
  // Função auxiliar para atualizar a pontuação total da auditoria
  const updateAuditoriaPontuacaoTotal = async (auditoriaId: string, uniqueRespostas: Map<string, any>) => {
    try {
      // Calcular pontuação total somando apenas as respostas únicas
      let pontuacaoTotal = 0;
      
      uniqueRespostas.forEach(resposta => {
        if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
          pontuacaoTotal += Number(resposta.pontuacao_obtida);
        }
      });
      
      console.log(`Atualizando pontuacao_total da auditoria ${auditoriaId}: ${pontuacaoTotal} (de ${uniqueRespostas.size} respostas únicas)`);
      
      const { error } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar pontuação total da auditoria:", error);
    }
  };

  // Calcular pontuações das seções quando o componente monta ou respostasExistentes muda
  useEffect(() => {
    if (auditoriaId) {
      console.log("Carregamento inicial - atualizando pontuações das seções");
      updateSectionScores();
    }
  }, [auditoriaId]);

  // Recalcular pontuações quando as respostas mudam
  useEffect(() => {
    if (respostasExistentes?.length) {
      console.log("Respostas alteradas - atualizando pontuações das seções");
      updateSectionScores();
    }
  }, [respostasExistentes]);

  return null; // Este é um componente lógico sem UI
};

export default SectionScores;
