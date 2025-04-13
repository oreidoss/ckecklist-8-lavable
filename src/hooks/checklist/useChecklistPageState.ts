
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useChecklist } from '@/hooks/checklist';
import { useQuestionHelpers } from '@/hooks/checklist/useQuestionHelpers';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useActiveSectionState } from '@/hooks/checklist/useActiveSectionState';
import { useSectionProgress } from '@/hooks/checklist/useSectionProgress';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { useNavigationHandlers } from '@/hooks/checklist/useNavigationHandlers';
import { useChecklistEditMode } from '@/hooks/checklist/useChecklistEditMode';
import { useChecklistEnhancedNavigation } from '@/hooks/checklist/useChecklistEnhancedNavigation';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { useEffect } from 'react';

/**
 * Main hook that combines all checklist state management functionality
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  
  // Fetch all data
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
  } = useChecklistData(auditoriaId);
  
  // Manage active section state
  const {
    activeSecao,
    setActiveSecao,
    isFirstSection,
    isLastSection
  } = useActiveSectionState(secoes);
  
  // Question helper functions
  const {
    getPerguntasBySecao,
    hasUnansweredQuestions,
    isLastPerguntaInSection
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
      console.log(`Navegado diretamente para próxima seção: ${nextSecaoId}`);
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
      console.log(`Navegado diretamente para seção anterior: ${prevSecaoId}`);
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

  // Process responses on initial load
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
  
  // Toggle edit mode wrapper to pass activeSecao
  const toggleEditMode = () => {
    toggleEditModeBase(activeSecao);
  };
  
  useEffect(() => {
    processExistingResponses();
  }, [respostasExistentes, perguntas, secoes]);

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
