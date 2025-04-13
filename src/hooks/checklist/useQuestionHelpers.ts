
import { useCallback } from 'react';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook for question-related helper functions
 */
export const useQuestionHelpers = (
  activeSecao: string | null,
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>
) => {
  // Get questions for the specified section
  const getPerguntasBySecao = useCallback((secaoId: string): Pergunta[] => {
    if (!perguntas) return [];
    return perguntas.filter(p => p.secao_id === secaoId);
  }, [perguntas]);

  // Check if there are unanswered questions in the active section
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
    // Consider all but the last two questions as required (typically the last two are for observations and attachments)
    const requiredQuestions = perguntasSecaoAtiva.slice(0, -2);
    return requiredQuestions.some(pergunta => !respostas[pergunta.id]);
  }, [activeSecao, perguntas, respostas]);

  // Check if the given question is the last one in the current section
  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!perguntas || !activeSecao) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  }, [perguntas, activeSecao]);

  return {
    getPerguntasBySecao,
    hasUnansweredQuestions,
    isLastPerguntaInSection
  };
};
