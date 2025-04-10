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
    goToNextSection: goToNextSectionBase,
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
  const toggleEditMode = () => {
    if (!activeSecao) return;
    
    console.log(`Alternando modo de edição para seção ${activeSecao}. Atual: ${editingSections[activeSecao]}`);
    
    setEditingSections(prev => {
      const newState = {
        ...prev,
        [activeSecao]: !prev[activeSecao]
      };
      console.log("Novo estado de edição:", newState);
      return newState;
    });
    
    // Mostrar toast informando sobre a mudança de modo
    setTimeout(() => {
      toast({
        title: editingSections[activeSecao] ? "Modo visualização ativado" : "Modo edição ativado",
        description: editingSections[activeSecao] 
          ? "As respostas desta seção agora estão em modo visualização."
          : "Você agora pode editar as respostas desta seção.",
      });
    }, 100);
  };
  
  // Método para salvar e navegar para próxima seção com opções adicionais
  const enhancedSaveAndNavigateToNextSection = async (): Promise<boolean> => {
    try {
      // Salvar respostas da seção atual
      console.log("Salvando respostas e navegando para próxima seção");
      
      // Salvar todas as respostas
      await saveAllResponses();
      console.log("Respostas salvas com sucesso");
      
      if (activeSecao) {
        // Desativar modo de edição para a seção atual após salvar
        setEditingSections(prev => ({
          ...prev,
          [activeSecao]: false
        }));
        
        // Navegar para a próxima seção
        if (secoes) {
          const currentIndex = secoes.findIndex(s => s.id === activeSecao);
          if (currentIndex < secoes.length - 1) {
            const nextSecaoId = secoes[currentIndex + 1].id;
            console.log(`Navegando para a próxima seção: ${nextSecaoId}`);
            
            // Ativar modo de edição para próxima seção se não estiver completa
            const shouldEnableEditing = !completedSections.includes(nextSecaoId);
            setEditingSections(prev => ({
              ...prev,
              [nextSecaoId]: shouldEnableEditing
            }));
            
            // Atualizar seção ativa
            setActiveSecao(nextSecaoId);
            window.scrollTo(0, 0);
            
            toast({
              title: "Navegação bem-sucedida",
              description: "Respostas salvas e navegando para próxima seção.",
            });
            
            return true;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar e navegar:", error);
      toast({
        title: "Erro ao navegar",
        description: "Ocorreu um erro ao salvar as respostas antes de navegar. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  useEffect(() => {
    processExistingResponses();
    
    // Inicializar o estado de edição para todas as seções
    if (secoes && completedSections) {
      console.log("Inicializando estado de edição para seções");
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        // Seções incompletas começam em modo de edição
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
