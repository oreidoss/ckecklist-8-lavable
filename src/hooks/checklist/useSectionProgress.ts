
import { useState, useCallback } from 'react';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook for tracking section completion progress
 */
export const useSectionProgress = (
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>,
  activeSecao: string | null
) => {
  const [progresso, setProgresso] = useState<number>(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);

  // Calculate the total number of questions in the active section
  const getActiveQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    return perguntas.filter(p => p.secao_id === activeSecao).length;
  }, [activeSecao, perguntas]);

  // Calculate the number of answered questions in the active section
  const getAnsweredQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    
    const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
    return perguntasSecaoAtiva.filter(pergunta => respostas[pergunta.id]).length;
  }, [activeSecao, perguntas, respostas]);

  // Update list of incomplete sections based on responses
  const updateIncompleteSections = useCallback(() => {
    if (!perguntas || !respostas) return;
    
    const incomplete = new Set<string>();
    
    // Group perguntas by section
    const perguntasBySection: Record<string, Pergunta[]> = {};
    perguntas.forEach(pergunta => {
      if (!perguntasBySection[pergunta.secao_id]) {
        perguntasBySection[pergunta.secao_id] = [];
      }
      perguntasBySection[pergunta.secao_id].push(pergunta);
    });
    
    // Check each section for incomplete questions
    Object.entries(perguntasBySection).forEach(([secaoId, secaoPerguntas]) => {
      // Consider only required questions (excluding the last two, typically for observations and attachments)
      const requiredPerguntas = secaoPerguntas.slice(0, -2);
      
      if (requiredPerguntas.length > 0 && 
          requiredPerguntas.some(p => !respostas[p.id])) {
        incomplete.add(secaoId);
      }
    });
    
    setIncompleteSections(Array.from(incomplete));
  }, [perguntas, respostas]);

  // Update completed sections list
  const updateCompletedSections = useCallback((secaoId: string, isComplete: boolean) => {
    setCompletedSections(prev => {
      const existing = new Set(prev);
      
      if (isComplete) {
        existing.add(secaoId);
      } else {
        existing.delete(secaoId);
      }
      
      return Array.from(existing);
    });
    
    // Update incomplete sections after changing completed status
    updateIncompleteSections();
  }, [updateIncompleteSections]);

  return {
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    incompleteSections,
    setIncompleteSections,
    updateIncompleteSections,
    updateCompletedSections,
    getActiveQuestionCount,
    getAnsweredQuestionCount
  };
};
