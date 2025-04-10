
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useChecklistNavigation } from '@/hooks/checklist/useChecklistNavigation';
import { useChecklistResponses } from '@/hooks/checklist/useChecklistResponses';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const toast = useToast();
  
  // Fetch all data
  const dataState = useChecklistData(auditoriaId);
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
    refetchAuditoria
  } = dataState;
  
  // Section and editing state management - passing an empty array instead of completedSections
  // to avoid the variable reference error
  const { 
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
    getPerguntasBySecao
  } = useSectionManagement(secoes, []);  // Pass empty array initially

  // Section navigation and completion tracking
  const {
    respostas,
    setRespostas,
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    incompleteSections,
    setIncompleteSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving: navIsSaving,
    updateCompletedSections,
    updateIncompleteSections,
    goToPreviousSection,
    goToNextSection
  } = useChecklistNavigation(
    auditoriaId, 
    secoes, 
    perguntas, 
    activeSecao, 
    setActiveSecao,
    editingSections,
    setEditingSections,
    setPontuacaoPorSecao
  );

  // Response handlers and helpers
  const {
    handleResposta,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacao,
    handleSaveObservacaoWrapped,
    handleFileUpload,
    handleFileUploadWrapped,
    saveAllResponses,
    saveAndNavigateHome,
    saveAndNavigateToNextSection,
    isSaving: respIsSaving
  } = useChecklistResponses(
    auditoriaId, 
    activeSecao, 
    editingSections,
    setEditingSections,
    secoes, 
    respostas, 
    setRespostas, 
    observacoes, 
    fileUrls, 
    respostasExistentes, 
    perguntas, 
    setProgresso, 
    updateIncompleteSections, 
    goToNextSection,
    toast,
    setPontuacaoPorSecao
  );

  // Helpers for checklist operations
  const { 
    hasUnansweredQuestions, 
    isLastPerguntaInSection,
    getActiveQuestionCount,
    getAnsweredQuestionCount
  } = useChecklistHelpers(
    perguntas,
    respostas,
    activeSecao
  );

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

  // Update section editing state when completedSections changes
  useEffect(() => {
    if (secoes && completedSections?.length) {
      const updatedEditState: Record<string, boolean> = {...editingSections};
      secoes.forEach(secao => {
        // Sections that are not completed start in edit mode
        updatedEditState[secao.id] = !completedSections.includes(secao.id);
      });
      setEditingSections(updatedEditState);
    }
  }, [completedSections, secoes, setEditingSections, editingSections]);

  // Combine isSaving states
  const isSaving = navIsSaving || respIsSaving;

  return {
    // Data
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
    
    // State
    respostas,
    activeSecao,
    progresso,
    completedSections,
    incompleteSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    isEditingActive,
    editingSections,
    setEditingSections,
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    
    // Methods
    refetchAuditoria,
    getPerguntasBySecao,
    handleSetActiveSecao: setActiveSecao,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacaoWrapped,
    handleFileUploadWrapped,
    goToPreviousSection,
    goToNextSection,
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    saveAndNavigateHomeBase: saveAndNavigateHome,
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode,
    
    // Analytics helpers
    getActiveQuestionCount,
    getAnsweredQuestionCount,
    
    // Enhanced navigation
    saveAndNavigateToNextSection
  };
};
