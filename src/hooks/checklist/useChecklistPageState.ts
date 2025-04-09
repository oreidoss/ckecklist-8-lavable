
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useChecklistNavigation } from '@/hooks/checklist/useChecklistNavigation';
import { useChecklistResponses } from '@/hooks/checklist/useChecklistResponses';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useEditingMode } from '@/hooks/checklist/useEditingMode';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  
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
    isSaving,
    updateCompletedSections,
    updateIncompleteSections,
    goToPreviousSection,
    goToNextSection
  } = useChecklistNavigation(auditoriaId, secoes, perguntas, activeSecao, setActiveSecao, setPontuacaoPorSecao);

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
    saveAndNavigateToNextSection
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
    
    // Initialize editing mode for all sections based on completion status
    if (secoes && completedSections) {
      console.log("Inicializando estado de edição para seções");
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        initialEditState[secao.id] = !completedSections.includes(secao.id);
      });
      console.log("Estado inicial de edição:", initialEditState);
      setEditingSections(initialEditState);
    }
  }, [respostasExistentes, perguntas, secoes, completedSections]);

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
