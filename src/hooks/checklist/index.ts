
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useChecklistSave } from './useChecklistSave';
import { useChecklistSections } from './useChecklistSections';
import { useChecklistObservacoes } from './useChecklistObservacoes';
import { useChecklistRespostas } from './useChecklistRespostas';
import { useChecklistUploads } from './useChecklistUploads';
import { useChecklistScores } from './useChecklistScores';
import { useChecklistState } from './useChecklistState';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Main hook for checklist functionality
 */
export const useChecklist = (
  auditoriaId: string | undefined,
  perguntas: any[] | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Get state management hooks
  const { 
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    updateCompletedSections
  } = useChecklistState();
  
  // Get save functionality
  const { saveAndNavigateHome, isSaving, setIsSaving, isSendingEmail } = useChecklistSave(auditoriaId);
  
  // Get sections management functionality
  const {
    handleRespostaWithSections
  } = useChecklistSections({
    respostas,
    setRespostas,
    perguntas,
    updateCompletedSections,
    auditoriaId
  });
  
  // Get observacoes functionality
  const {
    observacoes,
    handleObservacaoChange,
    handleSaveObservacao
  } = useChecklistObservacoes(auditoriaId);
  
  // Get resposta handling functionality
  const {
    handleResposta
  } = useChecklistRespostas({
    handleRespostaWithSections,
    auditoriaId,
    setIsSaving
  });
  
  // Get file upload functionality
  const {
    uploading,
    fileUrls,
    handleFileUpload
  } = useChecklistUploads(auditoriaId, setIsSaving);
  
  // Get scores calculation functionality
  const {
    calculateScoresAndProgress,
    saveAllResponses: saveAllResponsesFromScores
  } = useChecklistScores({
    respostas,
    perguntas,
    auditoriaId,
    isSaving,
    setIsSaving,
    setProgresso,
    setPontuacaoPorSecao
  });
  
  // Calculate scores when respostas change
  useEffect(() => {
    if (perguntas) {
      calculateScoresAndProgress();
    }
  }, [respostas, perguntas]);
  
  // Function to save all responses
  const saveAllResponses = useCallback(async () => {
    return saveAllResponsesFromScores();
  }, [saveAllResponsesFromScores]);
  
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
    isSendingEmail,
    
    // Methods
    handleResposta,
    handleFileUpload,
    handleObservacaoChange,
    handleSaveObservacao,
    saveAndNavigateHome,
    saveAllResponses,
    updateCompletedSections
  };
};
