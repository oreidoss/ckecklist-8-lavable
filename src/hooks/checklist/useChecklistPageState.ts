
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useChecklistNavigation } from '@/hooks/checklist/useChecklistNavigation';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import { useChecklistInitialization } from '@/hooks/checklist/useChecklistInitialization';
import { useCombinedChecklistLogic } from '@/hooks/checklist/useCombinedChecklistLogic';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const toastObj = useToast();
  
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
  
  // Section and editing state management
  const { 
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
    getPerguntasBySecao
  } = useSectionManagement(secoes);

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

  // Initialize responses from existing data
  useChecklistInitialization(
    respostasExistentes,
    perguntas,
    secoes,
    respostas,
    setRespostas,
    setProgresso,
    setCompletedSections,
    updateIncompleteSections
  );

  // Combine response and navigation logic
  const {
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacaoWrapped,
    handleFileUploadWrapped,
    saveAllResponses,
    saveAndNavigateHome: saveAndNavigateHomeBase,
    saveAndNavigateToNextSection,
    isSaving: respIsSaving
  } = useCombinedChecklistLogic(
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
    saveAndNavigateHomeBase,
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
