
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

  // Calculate and update section scores
  const updateSectionScores = async () => {
    if (!auditoriaId) {
      console.log("No auditoriaId provided, can't update scores");
      return;
    }
    
    console.log("Updating section scores for auditoria:", auditoriaId);
    
    try {
      // Direct Supabase query for more accurate score calculation
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;
      console.log(`Found ${respostasData?.length || 0} responses for this auditoria`);

      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      console.log(`Found ${perguntasData?.length || 0} total questions`);
      
      // Calculate scores directly
      const scores: Record<string, number> = {};
      
      // Initialize all section scores to 0
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });
      
      // Direct scoring from responses
      const pontuacaoMap: Record<string, number> = {
        'Sim': 1,
        'Não': -1,
        'Regular': 0.5,
        'N/A': 0
      };
      
      // Log each resposta for debugging
      respostasData.forEach(resposta => {
        const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.secao_id) {
          const secaoId = pergunta.secao_id;
          // Get section name for better logging
          const secao = secoes?.find(s => s.id === secaoId);
          const secaoNome = secao ? secao.nome : 'unknown section';
          
          console.log(`Processing resposta for secao "${secaoNome}" (${secaoId}):`, {
            pergunta_id: resposta.pergunta_id,
            resposta: resposta.resposta,
            pontuacao_obtida: resposta.pontuacao_obtida
          });
          
          // Use the pontuacao_obtida if available, otherwise calculate from resposta
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Added pontuacao_obtida ${pontuacao} to secao "${secaoNome}", new total: ${scores[secaoId]}`);
          } else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Calculated pontuacao ${pontuacao} from resposta "${resposta.resposta}" for secao "${secaoNome}", new total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Final calculated scores:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Error calculating scores directly:", error);
      
      // Show error toast
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    }
  };

  // Calculate section scores when component mounts or respostasExistentes changes
  useEffect(() => {
    if (auditoriaId) {
      console.log("Initial load - updating section scores");
      updateSectionScores();
    }
  }, [auditoriaId]);

  // Recalculate scores when responses change
  useEffect(() => {
    if (respostasExistentes?.length) {
      console.log("Responses changed - updating section scores");
      updateSectionScores();
    }
  }, [respostasExistentes]);

  return null; // This is a logic component with no UI
};

export default SectionScores;
