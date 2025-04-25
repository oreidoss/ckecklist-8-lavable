
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SectionScoresProps {
  auditoriaId?: string;
  secoes?: any[];
  respostasExistentes?: any[];
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const SectionScores: React.FC<SectionScoresProps> = ({
  auditoriaId,
  secoes,
  respostasExistentes,
  setPontuacaoPorSecao
}) => {
  const { toast } = useToast();
  const [internalScores, setInternalScores] = React.useState<Record<string, number>>({});

  // Function to update scores either via prop or internal state
  const updateScores = (scores: Record<string, number>) => {
    if (setPontuacaoPorSecao) {
      setPontuacaoPorSecao(scores);
    } else {
      setInternalScores(scores);
    }
  };

  // Calcular e atualizar pontuações das seções
  const updateSectionScores = async () => {
    if (!auditoriaId) {
      console.log("Nenhum auditoriaId fornecido, não é possível atualizar pontuações");
      return;
    }
    
    console.log("Atualizando pontuações de seção para auditoria:", auditoriaId);
    
    try {
      // Get latest responses from Supabase
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId)
        .order('created_at', { ascending: false });
        
      if (respostasError) throw respostasError;
      console.log(`Encontradas ${respostasData?.length || 0} respostas para esta auditoria`);

      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      
      // Initialize scores
      const scores: Record<string, number> = {};
      perguntasData.forEach(pergunta => {
        if (pergunta.secao_id && !scores[pergunta.secao_id]) {
          scores[pergunta.secao_id] = 0;
        }
      });
      
      // Create pergunta -> seção mapping
      const perguntaPorSecao = perguntasData.reduce((acc, pergunta) => {
        if (pergunta.secao_id) {
          acc[pergunta.id] = pergunta.secao_id;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Get only the most recent response for each question
      const ultimasRespostas = new Map();
      const respostasOrdenadas = [...respostasData].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      respostasOrdenadas.forEach(resposta => {
        const perguntaId = resposta.pergunta_id;
        if (!ultimasRespostas.has(perguntaId)) {
          ultimasRespostas.set(perguntaId, resposta);
        }
      });
      
      // Calculate section scores
      ultimasRespostas.forEach((resposta) => {
        const secaoId = perguntaPorSecao[resposta.pergunta_id];
        if (secaoId) {
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            scores[secaoId] = (scores[secaoId] || 0) + Number(resposta.pontuacao_obtida);
          }
        }
      });
      
      console.log("Pontuações finais calculadas:", scores);
      updateScores(scores);
      
      // Update total score in auditoria
      let pontuacaoTotal = 0;
      ultimasRespostas.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      const { error } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Erro ao calcular pontuações:", error);
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    }
  };

  // Update scores when component mounts or respostas change
  useEffect(() => {
    if (auditoriaId) {
      console.log("Carregamento inicial - atualizando pontuações das seções");
      updateSectionScores();
    }
  }, [auditoriaId]);

  useEffect(() => {
    if (respostasExistentes?.length) {
      console.log("Respostas alteradas - atualizando pontuações das seções");
      updateSectionScores();
    }
  }, [respostasExistentes]);

  return null;
};

export default SectionScores;
