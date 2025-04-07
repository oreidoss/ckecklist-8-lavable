
import { useState } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';
import { useChecklistRespostas } from './useChecklistRespostas';
import { useChecklistObservacoes } from './useChecklistObservacoes';
import { useChecklistUploads } from './useChecklistUploads';
import { useChecklistSave } from './useChecklistSave';
import { useChecklistSections } from './useChecklistSections';
import { useChecklistState } from './useChecklistState';

/**
 * Main hook for checklist functionality
 */
export const useChecklist = (
  auditoriaId: string | undefined, 
  perguntas: Pergunta[] | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Checklist state
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
  
  // Handle respostas
  const { handleResposta, pontuacaoMap, saveAllResponses, updatePontuacaoPorSecao } = useChecklistRespostas(
    auditoriaId,
    setRespostas,
    setProgresso,
    observacoes,
    fileUrls,
    setPontuacaoPorSecao
  );
  
  // Handle observacoes
  const { handleObservacaoChange, handleSaveObservacao } = useChecklistObservacoes(
    auditoriaId,
    observacoes,
    setObservacoes
  );
  
  // Handle file uploads
  const { handleFileUpload } = useChecklistUploads(
    auditoriaId,
    uploading,
    setUploading,
    fileUrls,
    setFileUrls
  );
  
  // Handle sections
  const { markSectionAsComplete } = useChecklistSections(
    auditoriaId,
    completedSections,
    setCompletedSections
  );
  
  // Handle saving
  const { saveAndNavigateHome } = useChecklistSave(auditoriaId, progresso);
  
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
    handleResposta,
    handleObservacaoChange,
    handleSaveObservacao,
    handleFileUpload,
    markSectionAsComplete,
    saveAndNavigateHome,
    saveAllResponses,
    updatePontuacaoPorSecao
  };
};
