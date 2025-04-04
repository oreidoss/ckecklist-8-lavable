
import { useEffect } from 'react';
import { Pergunta } from '@/lib/types';
import { useChecklistState } from './useChecklistState';
import { useChecklistRespostas } from './useChecklistRespostas';
import { useChecklistObservacoes } from './useChecklistObservacoes';
import { useChecklistUploads } from './useChecklistUploads';
import { useChecklistSave } from './useChecklistSave';
import { useChecklistSections } from './useChecklistSections';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { supabase } from '@/integrations/supabase/client';

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

  // Create storage bucket for attachments if it doesn't exist
  useEffect(() => {
    const createBucket = async () => {
      try {
        // Check if the bucket exists
        const { data, error } = await supabase
          .storage
          .getBucket('auditoria-anexos');

        // If bucket doesn't exist, create it
        if (error && error.message.includes('not found')) {
          await supabase
            .storage
            .createBucket('auditoria-anexos', {
              public: true,
              fileSizeLimit: 10485760 // 10MB
            });
        }
      } catch (error) {
        console.error('Error creating bucket:', error);
      }
    };

    createBucket();
  }, []);

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
