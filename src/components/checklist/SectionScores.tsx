
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Resposta } from '@/lib/types';

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
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Função para calcular localmente as pontuações sem depender do Supabase
  const calcularPontuacoesLocalmente = () => {
    if (!secoes || !respostasExistentes) {
      console.log("Dados insuficientes para cálculo local de pontuações");
      return;
    }

    try {
      console.log("Calculando pontuações localmente com", respostasExistentes.length, "respostas");
      
      // Mapeamento direto de pontuação
      const pontuacaoMap: Record<string, number> = {
        'Sim': 1,
        'Não': -1,
        'Regular': 0.5,
        'N/A': 0
      };
      
      // Inicializar todas as pontuações de seção em 0
      const scores: Record<string, number> = {};
      secoes.forEach(secao => {
        scores[secao.id] = 0;
      });
      
      // Pegar apenas a resposta mais recente para cada pergunta
      const ultimasRespostas = new Map();
      
      // Ordenar as respostas por data, mais recentes primeiro
      const respostasOrdenadas = [...respostasExistentes].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Mapear respostas para os IDs de perguntas
      respostasOrdenadas.forEach((resposta: Resposta) => {
        const perguntaId = resposta.pergunta_id;
        if (!ultimasRespostas.has(perguntaId)) {
          ultimasRespostas.set(perguntaId, resposta);
        }
      });
      
      console.log(`Usando ${ultimasRespostas.size} respostas únicas de ${respostasExistentes.length} totais`);
      
      // Buscar dados de perguntas para mapear para as seções
      if (!auditoriaId) {
        console.log("Nenhum auditoriaId fornecido, só calculando pontuações localmente");
        return;
      }
      
      // Fazer uma solicitação única para obter todos os dados de perguntas
      supabase
        .from('perguntas')
        .select('*')
        .then(({ data: perguntas, error }) => {
          if (error) {
            console.error("Erro ao buscar perguntas:", error);
            return;
          }
          
          // Criar um mapa pergunta -> seção para acesso mais rápido
          const perguntaPorSecao = perguntas.reduce((acc, pergunta) => {
            if (pergunta.secao_id) {
              acc[pergunta.id] = pergunta.secao_id;
            }
            return acc;
          }, {} as Record<string, string>);
          
          // Agora processa apenas as respostas mais recentes
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
                const pontuacao = pontuacaoMap[resposta.resposta] !== undefined ? pontuacaoMap[resposta.resposta] : 0;
                scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
                console.log(`  Calculada pontuação ${pontuacao} da resposta "${resposta.resposta}" para seção "${secaoNome}", novo total: ${scores[secaoId]}`);
              }
            }
          });
          
          console.log("Pontuações finais calculadas:", scores);
          setPontuacaoPorSecao(scores);
          
          // Atualizar pontuação total da auditoria
          updateAuditoriaPontuacaoTotal(auditoriaId, ultimasRespostas, pontuacaoMap);
        })
        .catch(error => {
          console.error("Erro ao buscar dados de perguntas:", error);
        });
      
    } catch (error) {
      console.error("Erro ao calcular pontuações localmente:", error);
      
      // Mostrar toast de erro
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    }
  };
  
  // Função auxiliar para atualizar a pontuação total da auditoria
  const updateAuditoriaPontuacaoTotal = async (
    auditoriaId: string, 
    uniqueRespostas: Map<string, any>,
    pontuacaoMap: Record<string, number>
  ) => {
    try {
      // Calcular pontuação total somando apenas as respostas únicas
      let pontuacaoTotal = 0;
      
      uniqueRespostas.forEach(resposta => {
        if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
          pontuacaoTotal += Number(resposta.pontuacao_obtida);
        } else if (resposta.resposta) {
          // Se não tiver pontuacao_obtida, calcular com base na resposta
          const pontuacao = pontuacaoMap[resposta.resposta] !== undefined ? pontuacaoMap[resposta.resposta] : 0;
          pontuacaoTotal += pontuacao;
        }
      });
      
      console.log(`Atualizando pontuacao_total da auditoria ${auditoriaId}: ${pontuacaoTotal} (de ${uniqueRespostas.size} respostas únicas)`);
      
      const { error } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (error) {
        console.error("Erro ao atualizar pontuação total da auditoria:", error);
      }
    } catch (error) {
      console.error("Erro ao atualizar pontuação total da auditoria:", error);
    }
  };

  // Configurar intervalo de atualização de pontuação para garantir que as pontuações sejam atualizadas periodicamente
  useEffect(() => {
    if (auditoriaId && !intervalId) {
      calcularPontuacoesLocalmente();
      
      // Atualizar pontuações a cada 10 segundos
      const id = window.setInterval(() => {
        console.log("Atualizando pontuações periodicamente");
        calcularPontuacoesLocalmente();
        setUltimaAtualizacao(new Date());
      }, 10000);
      
      setIntervalId(id);
      
      return () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
      };
    }
  }, [auditoriaId, intervalId]);

  // Calcular pontuações das seções quando o componente monta ou respostasExistentes muda
  useEffect(() => {
    if (auditoriaId) {
      console.log("Carregamento inicial - calculando pontuações das seções");
      calcularPontuacoesLocalmente();
      setUltimaAtualizacao(new Date());
    }
  }, [auditoriaId]);

  // Recalcular pontuações quando as respostas mudam
  useEffect(() => {
    if (respostasExistentes?.length) {
      console.log("Respostas alteradas - calculando pontuações das seções");
      calcularPontuacoesLocalmente();
      setUltimaAtualizacao(new Date());
    }
  }, [respostasExistentes?.length]);

  return null; // Este é um componente lógico sem UI
};

export default SectionScores;
