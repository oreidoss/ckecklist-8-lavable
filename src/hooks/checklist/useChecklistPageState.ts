
import { useEffect, useState } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useChecklist } from '@/hooks/checklist';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useSectionState } from '@/hooks/checklist/useSectionState';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { useNavigationHandlers } from '@/hooks/checklist/useNavigationHandlers';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Estado para controlar o modo de edição por seção
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
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
    handleResposta: handleRespostaBase,
    handleFileUpload: handleFileUploadBase,
    handleObservacaoChange,
    handleSaveObservacao: handleSaveObservacaoBase,
    saveAndNavigateHome: saveAndNavigateHomeFromChecklist,
    saveAllResponses: saveAllResponsesBase,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);
  
  // Section navigation
  const {
    incompleteSections,
    setIncompleteSections,
    updateIncompleteSections,
    goToNextSection,
    goToPreviousSection,
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas
  });

  // Section state management (extracted to a new hook)
  const {
    activeSecao,
    setActiveSecao,
    getPerguntasBySecao
  } = useSectionState(secoes, perguntas, respostas);

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

  // Response handlers (extracted to a new hook)
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

  // Navigation handlers (extracted to a new hook)
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
  
  // Verificar se a seção atual está em modo de edição
  const isEditingActive = activeSecao ? editingSections[activeSecao] === true : false;
  
  // Alternar modo de edição para a seção atual
  const toggleEditMode = (secaoId?: string) => {
    const secao = secaoId || activeSecao;
    if (!secao) return;
    
    setEditingSections(prev => ({
      ...prev,
      [secao]: !prev[secao]
    }));
    
    toast({
      title: editingSections[secao] ? "Modo visualização ativado" : "Modo edição ativado",
      description: editingSections[secao] 
        ? "As respostas desta seção agora estão em modo visualização."
        : "Você agora pode editar as respostas desta seção.",
    });
  };
  
  // Método para salvar e navegar para próxima seção com opções adicionais
  const enhancedSaveAndNavigateToNextSection = async (): Promise<boolean> => {
    try {
      // Salvar respostas da seção atual
      const success = await saveAndNavigateToNextSection();
      
      if (success && activeSecao) {
        // Desativar modo de edição para a seção atual após salvar
        setEditingSections(prev => ({
          ...prev,
          [activeSecao]: false
        }));
        
        // Se a próxima seção já foi completada, não ativa o modo de edição automaticamente
        if (secoes) {
          const currentIndex = secoes.findIndex(s => s.id === activeSecao);
          if (currentIndex < secoes.length - 1) {
            const nextSecaoId = secoes[currentIndex + 1].id;
            // Se a próxima seção não tem respostas, ativar modo de edição automaticamente
            if (!completedSections.includes(nextSecaoId)) {
              setEditingSections(prev => ({
                ...prev,
                [nextSecaoId]: true
              }));
            }
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao salvar e navegar:", error);
      return false;
    }
  };
  
  useEffect(() => {
    processExistingResponses();
    
    // Inicializar o estado de edição para novas seções
    // Se a seção não tem respostas ainda, ativar modo de edição
    if (secoes && completedSections) {
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        initialEditState[secao.id] = !completedSections.includes(secao.id);
      });
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
    editingSections,
    isEditingActive,
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    setEditingSections,
    
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
