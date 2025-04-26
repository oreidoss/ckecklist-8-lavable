
import { useChecklistData } from './useChecklistData';
import { useChecklist } from './';
import { useActiveSection } from './useActiveSection';
import { useSectionNavigation } from './useSectionNavigation';
import { useChecklistProcessor } from './useChecklistProcessor';
import { useSectionState } from './useSectionState';
import { useSaveProgress } from './useSaveProgress';
import { useResponseHandlers } from './useResponseHandlers';
import { useNavigationHandlers } from './useNavigationHandlers';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Get data using existing hooks
  const checklistData = useChecklistData(auditoriaId);
  const {
    usuarios,
    auditoria,
    secoes,
    perguntas,
    respostasExistentes,
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    currentDate,
    isLoading,
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    refetchAuditoria,
    refetchRespostas
  } = checklistData;

  // Use active section management
  const {
    activeSecao,
    setActiveSecao,
    isEditingActive,
    toggleEditMode
  } = useActiveSection(secoes, []);

  // Use checklist functionality
  const {
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
    handleResposta,
    handleFileUpload,
    handleObservacaoChange,
    handleSaveObservacao,
    saveAllResponses,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);

  // Use section navigation
  const {
    incompleteSections,
    getPerguntasBySecao,
    updateIncompleteSections,
    goToNextSection,
    goToPreviousSection
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas,
    activeSecao,
    setActiveSecao
  });

  // Função wrapper garantindo retorno booleano explícito
  const saveAllAndReturnBoolean = async (respostasExistentes: any[]): Promise<boolean> => {
    try {
      await saveAllResponses();
      console.log("saveAllAndReturnBoolean: respostas salvas com sucesso");
      // Após salvar, atualize as respostas existentes
      await refetchRespostas();
      return true;
    } catch (error) {
      console.error("Error in saveAllAndReturnBoolean:", error);
      return false;
    }
  };

  // Use save progress functionality
  const {
    isSendingEmail,
    saveAndNavigateHome: saveAndNavigateHomeBase
  } = useSaveProgress(
    saveAllResponses,
    saveAllAndReturnBoolean
  );
  
  // Use response handlers
  const {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  } = useResponseHandlers(
    handleResposta,
    handleFileUpload,
    handleSaveObservacao,
    respostasExistentes,
    perguntas,
    updateIncompleteSections
  );

  // Use navigation handlers
  const {
    handleSetActiveSecao,
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    saveAndNavigateToNextSection
  } = useNavigationHandlers(
    activeSecao,
    setActiveSecao,
    secoes,
    goToNextSection,
    goToPreviousSection,
    saveAllResponses,
    saveAndNavigateHomeBase
  );

  // Return all the necessary values and functions
  return {
    // Data from useChecklistData
    usuarios,
    auditoria,
    secoes,
    perguntas,
    respostasExistentes,
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    currentDate,
    isLoading,
    
    // State management
    respostas,
    activeSecao,
    progresso,
    completedSections,
    incompleteSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    isSendingEmail,
    isEditingActive,
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    
    // Methods
    refetchAuditoria,
    refetchRespostas,
    getPerguntasBySecao,
    handleSetActiveSecao,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacaoWrapped,
    handleFileUploadWrapped,
    goToPreviousSection,
    goToNextSection,
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode,
    saveAndNavigateHomeBase,
    saveAndNavigateToNextSection
  };
};
