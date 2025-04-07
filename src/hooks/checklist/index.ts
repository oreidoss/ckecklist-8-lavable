
// File: src/hooks/checklist/index.ts
import { useState, useEffect } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklistSections } from './useChecklistSections';
import { useChecklistObservacoes } from './useChecklistObservacoes';
import { useChecklistUploads } from './useChecklistUploads';
import { useChecklistRespostas } from './useChecklistRespostas';
import { useChecklistSave } from './useChecklistSave';
import { Pergunta } from '@/lib/types';

/**
 * Main hook that combines all the checklist hooks
 */
export function useChecklist(
  auditoriaId: string | undefined, 
  perguntas: Pergunta[] = [],
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) {
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  // Import sub-hooks for checklist functionality
  const { 
    updateCompletedSections, 
    markSectionAsComplete 
  } = useChecklistSections(auditoriaId, completedSections, setCompletedSections);
  
  const {
    observacoes,
    handleObservacaoChange,
    handleSaveObservacao
  } = useChecklistObservacoes(auditoriaId);
  
  const {
    uploading,
    fileUrls,
    handleFileUpload
  } = useChecklistUploads(auditoriaId);
  
  const {
    isSaving,
    handleResposta,
    saveAllResponses
  } = useChecklistRespostas(auditoriaId, setRespostas, setProgresso, observacoes, fileUrls, setPontuacaoPorSecao);
  
  const {
    saveAndNavigateHome
  } = useChecklistSave(auditoriaId);

  // Update section completion status when responses change
  useEffect(() => {
    if (!auditoriaId || !perguntas || perguntas.length === 0) return;
    
    // Calculate progress
    const progresso = perguntas.length > 0 ? 
      (Object.keys(respostas).length / perguntas.length) * 100 : 0;
    
    setProgresso(progresso);
  }, [respostas, perguntas, auditoriaId]);

  return {
    // State
    respostas,
    setRespostas,
    progresso, 
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    
    // Methods
    updateCompletedSections,
    markSectionAsComplete,
    handleResposta,
    handleFileUpload,
    handleObservacaoChange,
    handleSaveObservacao,
    saveAndNavigateHome,
    saveAllResponses
  };
}
