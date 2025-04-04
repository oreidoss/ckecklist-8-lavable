
import { useEffect } from 'react';
import { Pergunta } from '@/lib/types';
import { useChecklistState } from './useChecklistState';
import { useChecklistRespostas } from './useChecklistRespostas';
import { useChecklistObservacoes } from './useChecklistObservacoes';
import { useChecklistUploads } from './useChecklistUploads';
import { useChecklistSave } from './useChecklistSave';
import { useChecklistSections } from './useChecklistSections';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Main hook that combines all checklist-related hooks
 */
export const useChecklist = (auditoriaId: string | undefined, perguntas: Pergunta[] | undefined) => {
  const {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    setObservacoes,
    uploading,
    setUploading,
    fileUrls,
    setFileUrls,
    isSaving,
    setIsSaving
  } = useChecklistState();

  const { handleResposta, pontuacaoMap } = useChecklistRespostas(
    auditoriaId, 
    setRespostas, 
    setProgresso, 
    observacoes, 
    fileUrls
  );

  const { handleObservacaoChange, handleSaveObservacao } = useChecklistObservacoes(
    auditoriaId,
    observacoes,
    setObservacoes
  );

  const { handleFileUpload } = useChecklistUploads(
    auditoriaId,
    setFileUrls,
    setUploading
  );

  const { saveAndNavigateHome } = useChecklistSave(auditoriaId, progresso);

  const { updateCompletedSections } = useChecklistSections(
    completedSections,
    setCompletedSections,
    respostas
  );

  return {
    // State
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    observacoes,
    setObservacoes,
    uploading,
    setUploading,
    fileUrls,
    setFileUrls,
    isSaving,
    setIsSaving,
    
    // Handlers
    handleResposta,
    handleObservacaoChange,
    handleSaveObservacao,
    handleFileUpload,
    saveAndNavigateHome,
    updateCompletedSections
  };
};

// Re-export all hooks for direct usage
export * from './useChecklistState';
export * from './useChecklistRespostas';
export * from './useChecklistObservacoes';
export * from './useChecklistUploads';
export * from './useChecklistSave';
export * from './useChecklistSections';
