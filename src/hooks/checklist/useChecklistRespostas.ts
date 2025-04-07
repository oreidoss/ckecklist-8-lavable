
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';
import { useChecklistScores } from './useChecklistScores';
import { useRespostaHandler } from './useRespostaHandler';
import { useSaveResponses } from './useSaveResponses';

/**
 * Hook for managing checklist responses - now refactored to use smaller, focused hooks
 */
export const useChecklistRespostas = (
  auditoriaId: string | undefined, 
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  observacoes: Record<string, string>,
  fileUrls: Record<string, string>,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Use the newly created hooks
  const { pontuacaoMap, updatePontuacaoPorSecao } = useChecklistScores(auditoriaId, setPontuacaoPorSecao);
  
  const { handleResposta, isSaving: isSavingResponse } = useRespostaHandler(
    auditoriaId, 
    setRespostas, 
    setProgresso, 
    observacoes, 
    fileUrls, 
    updatePontuacaoPorSecao
  );
  
  const { saveAllResponses, isSaving: isSavingAll } = useSaveResponses(
    auditoriaId,
    updatePontuacaoPorSecao
  );
  
  // Combine isSaving states from both hooks
  const isSaving = isSavingResponse || isSavingAll;

  return { 
    handleResposta, 
    pontuacaoMap, 
    isSaving, 
    saveAllResponses, 
    updatePontuacaoPorSecao 
  };
};
