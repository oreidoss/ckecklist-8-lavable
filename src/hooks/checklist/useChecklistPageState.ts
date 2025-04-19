
import { useChecklistData } from './useChecklistData';
import { useChecklist } from './';
import { useSectionNavigation } from './useSectionNavigation';
import { useChecklistProcessor } from './useChecklistProcessor';
import { useSectionState } from './useSectionState';
import { useSaveProgress } from './useSaveProgress';

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
    refetchAuditoria
  } = checklistData;

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
    goToPreviousSection,
    handleSetActiveSecao
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas,
    activeSecao: null,
    setActiveSecao: handleSetActiveSecao
  });

  // Use section state management
  const {
    isEditingActive,
    editingSections,
    setEditingSections,
    toggleEditMode
  } = useSectionState({
    secoes,
    activeSecao: null,
    completedSections,
    setCompletedSections,
    respostas,
    perguntas
  });

  // Use save progress functionality
  const {
    isSaving,
    setIsSaving,
    saveAndNavigateHome
  } = useSaveProgress(saveAllResponses, saveAllResponses);

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
    handleSetActiveSecao,
    handleResposta,
    handleObservacaoChange,
    handleSaveObservacao,
    handleFileUpload,
    goToPreviousSection,
    goToNextSection,
    saveAndNavigateHome,
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode
  };
};
