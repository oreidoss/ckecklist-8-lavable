
import { useCallback } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook providing utility functions for working with checklist data
 * 
 * @param perguntas Questions data array
 * @param respostas Current response values
 * @param activeSecao Currently active section ID
 * @returns Helper functions for checklist operations
 */
export const useChecklistHelpers = (
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>,
  activeSecao: string | null
) => {
  /**
   * Checks if there are any unanswered questions in the active section
   * (excluding the last two questions which are considered optional)
   */
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
    // Consider all but the last two questions as required
    const requiredQuestions = perguntasSecaoAtiva.slice(0, -2);
    return requiredQuestions.some(pergunta => !respostas[pergunta.id]);
  }, [activeSecao, perguntas, respostas]);

  /**
   * Checks if the given question is the last one in the current section
   */
  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!perguntas || !activeSecao) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  }, [perguntas, activeSecao]);

  /**
   * Calculates the total number of questions in the active section
   */
  const getActiveQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    return perguntas.filter(p => p.secao_id === activeSecao).length;
  }, [activeSecao, perguntas]);

  /**
   * Calculates the number of answered questions in the active section
   */
  const getAnsweredQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    
    const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
    return perguntasSecaoAtiva.filter(pergunta => respostas[pergunta.id]).length;
  }, [activeSecao, perguntas, respostas]);

  return {
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    getActiveQuestionCount,
    getAnsweredQuestionCount
  };
};
