
import { useEffect } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useChecklist } from '@/hooks/checklist';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { useNavigationHandlers } from '@/hooks/checklist/useNavigationHandlers';
import { useActiveSection } from '@/hooks/checklist/useActiveSection';
import { useEnhancedNavigation } from '@/hooks/checklist/useEnhancedNavigation';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
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
  
  // Section state management with active section tracking
  const {
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode
  } = useActiveSection(secoes, completedSections);
  
  // Section navigation
  const {
    incompleteSections,
    setIncompleteSections,
    updateIncompleteSections,
    goToNextSection: goToNextSectionBase,
    goToPreviousSection,
    getPerguntasBySecao
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas,
    activeSecao,
    setActiveSecao
  });

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

  // Função personalizada para goToNextSection
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

  // Navigation handlers
  const {
    handleSetActiveSecao,
    saveAndNavigateHome: saveAndNavigateHomeBase,
    saveAllResponses,
    saveAndNavigateToNextSection
  } = useNavigationHandlers(
    activeSecao,
    setActiveSecao,
    secoes,
    goToNextSection,
    goToPreviousSection,
    saveAllResponsesBase,
    saveAndNavigateHomeFromChecklist
  );

  // Enhanced navigation with editing mode management
  const { enhancedSaveAndNavigateToNextSection } = useEnhancedNavigation(
    activeSecao,
    setActiveSecao,
    secoes,
    editingSections,
    setEditingSections,
    completedSections,
    saveAllResponses
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
    
    // New features from refactored hooks
    getActiveQuestionCount,
    getAnsweredQuestionCount,
    
    // Enhanced methods
    saveAndNavigateToNextSection: enhancedSaveAndNavigateToNextSection
  };
};
