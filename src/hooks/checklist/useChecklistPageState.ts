
import { useToast } from '@/hooks/use-toast';
import { useChecklist } from '@/hooks/checklist';
import { useActiveSectionState } from '@/hooks/checklist/useActiveSectionState';
import { useSectionProgress } from '@/hooks/checklist/useSectionProgress';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { useNavigationHandlers } from '@/hooks/checklist/useNavigationHandlers';
import { useChecklistEditMode } from '@/hooks/checklist/useChecklistEditMode';
import { useChecklistEnhancedNavigation } from '@/hooks/checklist/useChecklistEnhancedNavigation';
import { useQuestionHelpers } from '@/hooks/checklist/useQuestionHelpers';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useResponseProcessor } from '@/hooks/checklist/useResponseProcessor';
import { useChecklistDataFetching } from '@/hooks/checklist/useChecklistDataFetching';
import { useEffect } from 'react';

/**
 * Main hook that combines all checklist state management functionality
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  
  // Fetch all data - now using the dedicated data fetching hook
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
  } = useChecklistDataFetching(auditoriaId);
  
  // Manage active section state
  const {
    activeSecao,
    setActiveSecao,
    isFirstSection,
    isLastSection
  } = useActiveSectionState(secoes);
  
  // Question helper functions
  const {
    getPerguntasBySecao
  } = useQuestionHelpers(activeSecao, perguntas, {});
  
  // Checklist state and handlers
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
    isSendingEmail,
    handleResposta: handleRespostaBase,
    handleFileUpload: handleFileUploadBase,
    handleObservacaoChange,
    handleSaveObservacao: handleSaveObservacaoBase,
    saveAndNavigateHome: saveAndNavigateHomeFromChecklist,
    saveAllResponses: saveAllResponsesBase,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);
  
  // Section progress tracking
  const {
    incompleteSections,
    setIncompleteSections,
    updateIncompleteSections,
    getActiveQuestionCount,
    getAnsweredQuestionCount
  } = useSectionProgress(perguntas, respostas, activeSecao);

  // Response processor - new hook
  const {
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    processResponses
  } = useResponseProcessor(respostas, perguntas, secoes, activeSecao);

  // Response handlers
  const {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  } = useResponseHandlers(
    handleRespostaBase,
    handleFileUploadBase,
    handleSaveObservacaoBase,
    respostasExistentes,
    perguntas,
    updateIncompleteSections
  );

  // Edit mode management
  const {
    editingSections,
    setEditingSections,
    toggleEditMode: toggleEditModeBase,
    isEditingActive
  } = useChecklistEditMode(secoes, completedSections);

  // Simple function to go to next section
  const goToNextSection = () => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      const nextSecaoId = secoes[currentIndex + 1].id;
      setActiveSecao(nextSecaoId);
      window.scrollTo(0, 0);
    }
  };
  
  // Simple function to go to previous section
  const goToPreviousSection = () => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex > 0) {
      const prevSecaoId = secoes[currentIndex - 1].id;
      setActiveSecao(prevSecaoId);
      window.scrollTo(0, 0);
    }
  };

  // Navigation handlers
  const {
    handleSetActiveSecao,
    saveAndNavigateHome: saveAndNavigateHomeBase,
    saveAllResponses,
    saveAndNavigateToNextSection: basicSaveAndNavigateToNextSection
  } = useNavigationHandlers(
    activeSecao,
    setActiveSecao,
    secoes,
    goToNextSection,
    goToPreviousSection,
    saveAllResponsesBase,
    saveAndNavigateHomeFromChecklist
  );
  
  // Enhanced navigation with edit mode handling
  const {
    enhancedSaveAndNavigateToNextSection,
    enhancedNavigateToPreviousSection
  } = useChecklistEnhancedNavigation(
    activeSecao,
    secoes,
    saveAllResponses,
    setActiveSecao,
    editingSections,
    setEditingSections,
    completedSections
  );
  
  // Toggle edit mode wrapper to pass activeSecao
  const toggleEditMode = () => {
    toggleEditModeBase(activeSecao);
  };
  
  // Process responses on initial load
  useEffect(() => {
    if (respostasExistentes?.length) {
      processResponses(
        respostasExistentes,
        setRespostas,
        setProgresso,
        updateIncompleteSections
      );
    }
  }, [respostasExistentes, perguntas, secoes, processResponses, setRespostas, setProgresso, updateIncompleteSections]);

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
    isSendingEmail,
    isEditingActive: isEditingActive(activeSecao),
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    
    // Methods
    refetchAuditoria,
    getPerguntasBySecao,
    handleSetActiveSecao,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacaoWrapped,
    handleFileUploadWrapped,
    goToPreviousSection: enhancedNavigateToPreviousSection,
    goToNextSection,
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    saveAndNavigateHomeBase,
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode,
    
    // New features from refactored hooks
    getActiveQuestionCount,
    getAnsweredQuestionCount,
    
    // Enhanced methods
    saveAndNavigateToNextSection: enhancedSaveAndNavigateToNextSection
  };
};
