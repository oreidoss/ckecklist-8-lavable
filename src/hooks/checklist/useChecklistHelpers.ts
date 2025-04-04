
import { useCallback } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

export const useChecklistHelpers = (
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>,
  activeSecao: string | null
) => {
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
    // Consider all but the last two questions as required
    const requiredQuestions = perguntasSecaoAtiva.slice(0, -2);
    return requiredQuestions.some(pergunta => !respostas[pergunta.id]);
  }, [activeSecao, perguntas, respostas]);

  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!perguntas || !activeSecao) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  }, [perguntas, activeSecao]);

  return {
    hasUnansweredQuestions,
    isLastPerguntaInSection
  };
};
