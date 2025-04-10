
import { useState } from 'react';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useRespostaHandler } from '@/hooks/checklist/useRespostaHandler';
import { useSaveResponses } from '@/hooks/checklist/useSaveResponses';
import { useChecklistScores } from '@/hooks/checklist/useChecklistScores';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import { useChecklistStatus } from '@/hooks/checklist/useChecklistStatus';
import { useChecklistNavigation } from '@/hooks/checklist/useChecklistNavigation';
import { useInitialData } from '@/hooks/checklist/useInitialData';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Main hook for the checklist page state - now composed of smaller hooks
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // State management
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  // Fetch data from Supabase
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
    isLoading: dataLoading,
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    refetchAuditoria,
    refetchRespostas
  } = useChecklistData(auditoriaId);

  // Manage checklist status and progress
  const {
    progresso,
    setProgresso,
    completedSections,
    setCompletedSections,
    incompleteSections,
    setIncompleteSections,
    updateCompletedSections,
    updateIncompleteSections,
  } = useChecklistStatus(secoes, perguntas, respostas);

  // Process initial data
  const { initializingData } = useInitialData(
    respostasExistentes,
    perguntas,
    setRespostas,
    setObservacoes,
    setFileUrls,
    setProgresso,
    updateCompletedSections,
    updateIncompleteSections
  );

  // Section management
  const { 
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
  } = useSectionManagement(secoes, completedSections);

  // Handle scores
  const { 
    updatePontuacaoPorSecao 
  } = useChecklistScores(auditoriaId, setPontuacaoPorSecao);

  // Handle individual responses
  const { 
    handleResposta,
    isSaving: isSavingResponse 
  } = useRespostaHandler(
    auditoriaId,
    setRespostas,
    setProgresso,
    observacoes,
    fileUrls,
    updatePontuacaoPorSecao
  );

  // Handle batch saving
  const { 
    saveAllResponses,
    isSaving: isSavingAll 
  } = useSaveResponses(
    auditoriaId,
    updatePontuacaoPorSecao
  );

  // Utility functions
  const {
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    getPerguntasBySecao
  } = useChecklistHelpers(activeSecao, perguntas, respostas);

  // Wrap response handlers
  const {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  } = useResponseHandlers(
    handleResposta,
    (perguntaId, file) => {
      console.log(`Upload de arquivo para pergunta ${perguntaId}`);
      // Set uploading state
      setUploading(prev => ({ ...prev, [perguntaId]: true }));
      
      // Simulate upload completion - in a real app this would be an async function
      setTimeout(() => {
        setUploading(prev => ({ ...prev, [perguntaId]: false }));
        setFileUrls(prev => ({ ...prev, [perguntaId]: URL.createObjectURL(file) }));
      }, 1000);
    },
    (perguntaId) => {
      console.log(`Salvando observação para pergunta ${perguntaId}`);
      // Here you would save to the database
    },
    respostasExistentes,
    perguntas,
    updateIncompleteSections
  );

  // Navigation
  const {
    goToPreviousSection,
    goToNextSection,
    saveAndNavigateToNextSection,
    saveAndNavigateHome: saveAndNavigateHomeBase
  } = useChecklistNavigation(
    secoes,
    activeSecao,
    setActiveSecao,
    saveAllResponses
  );

  // Handle observacao change
  const handleObservacaoChange = (perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  };

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

  // Combine loading states
  const isLoading = dataLoading || initializingData;
  
  // Combine saving states
  const isSaving = isSavingResponse || isSavingAll;

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
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    setEditingSections,
    
    // Methods
    refetchAuditoria,
    refetchRespostas,
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
    saveAndNavigateToNextSection
  };
};

// Need to import useEffect
import { useEffect } from 'react';
