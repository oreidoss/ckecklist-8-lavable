
import { useCallback } from 'react';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook providing utility functions for the checklist
 */
export const useChecklistHelpers = (
  activeSecao: string | null,
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>
) => {
  // Check if there are unanswered questions in the active section
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    const activePerguntas = perguntas.filter(p => p.secao_id === activeSecao);
    return activePerguntas.some(p => !respostas[p.id]);
  }, [activeSecao, perguntas, respostas]);

  // Check if the given pergunta is the last one in the section
  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!activeSecao || !perguntas) return false;
    
    const activePerguntas = perguntas.filter(p => p.secao_id === activeSecao);
    if (activePerguntas.length === 0) return false;
    
    return activePerguntas[activePerguntas.length - 1].id === perguntaId;
  }, [activeSecao, perguntas]);

  // Get perguntas for a specific section
  const getPerguntasBySecao = useCallback((secaoId: string) => {
    if (!perguntas) return [];
    return perguntas.filter(p => p.secao_id === secaoId);
  }, [perguntas]);

  return {
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    getPerguntasBySecao
  };
};
