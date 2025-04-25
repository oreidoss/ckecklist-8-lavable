
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
    setCompletedSections
  } = useChecklistState();
  
  // Get sections management functionality
  const checklistSections = useChecklistSections(
    auditoriaId, 
    completedSections, 
    setCompletedSections
  );
  
  // Get save functionality
  const { saveAndNavigateHome, isSaving, setIsSaving, isSendingEmail, sendReportEmail } = useChecklistSave(auditoriaId);
  
  // Get observacoes functionality
  const {
    observacoes,
    handleObservacaoChange,
    handleSaveObservacao
  } = useChecklistObservacoes(auditoriaId);
  
  // Get file upload functionality - moved before it's used in useChecklistRespostas
  const {
    uploading,
    fileUrls,
    handleFileUpload
  } = useChecklistUploads(auditoriaId);
  
  // Get resposta handling functionality - now fileUrls is defined before this point
  const {
    handleResposta
  } = useChecklistRespostas(
    auditoriaId, 
    setRespostas, 
    setProgresso, 
    observacoes, 
    fileUrls, 
    setPontuacaoPorSecao
  );
  
  // Get scores calculation functionality
  const checklistScores = useChecklistScores(auditoriaId, setPontuacaoPorSecao);
  
  // Calculate scores when respostas change
  useEffect(() => {
    if (perguntas) {
      checklistScores.updatePontuacaoPorSecao();
    }
  }, [respostas, perguntas]);
  
  // Function to save all responses
  const saveAllResponses = useCallback(async () => {
    return checklistScores.updatePontuacaoPorSecao();
  }, [checklistScores.updatePontuacaoPorSecao]);
  
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
    updateCompletedSections: checklistSections.updateCompletedSections
  };
};
