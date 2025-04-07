
import { useState } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook to manage section completion state
 */
export const useChecklistSections = (
  auditoriaId: string | undefined,
  completedSections: string[],
  setCompletedSections: React.Dispatch<React.SetStateAction<string[]>>
) => {
  
  const updateCompletedSections = (activeSecao: string | null, secoes: any[], perguntas: Pergunta[]) => {
    if (activeSecao && perguntas) {
      const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
      const todasRespondidasSecaoAtiva = perguntasSecaoAtiva.every(p => 
        p.id !== undefined // Ensure all questions have responses
      );
      
      if (todasRespondidasSecaoAtiva && !completedSections.includes(activeSecao)) {
        setCompletedSections(prev => [...prev, activeSecao]);
      }
    }
  };
  
  const markSectionAsComplete = (secaoId: string) => {
    if (!completedSections.includes(secaoId)) {
      setCompletedSections(prev => [...prev, secaoId]);
    }
  };

  return { 
    updateCompletedSections,
    markSectionAsComplete 
  };
};
