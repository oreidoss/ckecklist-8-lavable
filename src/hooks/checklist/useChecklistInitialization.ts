
import { useEffect } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta, Secao, Resposta } from '@/lib/types';

/**
 * Hook to handle initializing checklist data from existing responses
 */
export const useChecklistInitialization = (
  respostasExistentes: Resposta[] | undefined,
  perguntas: Pergunta[] | undefined,
  secoes: Secao[] | undefined,
  respostas: Record<string, RespostaValor>,
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  setCompletedSections: React.Dispatch<React.SetStateAction<string[]>>,
  updateIncompleteSections: () => void
) => {
  // Process existing responses on initial load
  const { processExistingResponses } = useChecklistProcessor(
    respostasExistentes,
    perguntas,
    secoes,
    respostas,
    setRespostas,
    setProgresso,
    setCompletedSections,
    updateIncompleteSections
  );
  
  // Initialize state on load
  useEffect(() => {
    processExistingResponses();
  }, [respostasExistentes, perguntas, secoes, processExistingResponses]);

  return { processExistingResponses };
};

// Import from existing file to avoid circular dependencies
import { useChecklistProcessor } from './useChecklistProcessor';
