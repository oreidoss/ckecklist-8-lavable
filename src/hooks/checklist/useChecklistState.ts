import { useState } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook básico para gerenciar estado do checklist
 */
export const useChecklistState = () => {
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  return {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections
  };
};