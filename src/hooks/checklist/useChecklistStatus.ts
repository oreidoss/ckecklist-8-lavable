
import { useState, useCallback } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook to manage completion status and progress of checklist sections
 */
export const useChecklistStatus = (
  secoes: Secao[] | undefined,
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>
) => {
  const [progresso, setProgresso] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);

  // Update completed sections
  const updateCompletedSections = useCallback(() => {
    if (!secoes || !perguntas) return;
    
    const completed: string[] = [];
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      if (secaoPerguntas.length > 0 && 
          secaoPerguntas.every(p => respostas[p.id])) {
        completed.push(secao.id);
      }
    });
    
    setCompletedSections(completed);
  }, [secoes, perguntas, respostas]);

  // Update incomplete sections
  const updateIncompleteSections = useCallback(() => {
    if (!secoes || !perguntas) return;
    
    const incomplete: string[] = [];
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      if (secaoPerguntas.length > 0 && 
          secaoPerguntas.some(p => !respostas[p.id])) {
        incomplete.push(secao.id);
      }
    });
    
    setIncompleteSections(incomplete);
  }, [secoes, perguntas, respostas]);

  // Update overall progress
  const updateProgress = useCallback(() => {
    if (!perguntas) return;
    
    const totalQuestions = perguntas.length;
    const answeredQuestions = Object.keys(respostas).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    setProgresso(progress);
  }, [perguntas, respostas]);

  return {
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    incompleteSections,
    setIncompleteSections,
    updateCompletedSections,
    updateIncompleteSections,
    updateProgress
  };
};
