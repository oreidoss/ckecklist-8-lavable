
import { useChecklistData } from './useChecklistData';
import { useChecklist } from './';
import { useActiveSection } from './useActiveSection';
import { useSectionNavigation } from './useSectionNavigation';
import { useChecklistProcessor } from './useChecklistProcessor';
import { useSectionState } from './useSectionState';
import { useSaveProgress } from './useSaveProgress';
import { useResponseHandlers } from './useResponseHandlers';
import { useNavigationHandlers } from './useNavigationHandlers';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

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
    isSaving,
    handleResposta,
    handleFileUpload,
    handleObservacaoChange,
    handleSaveObservacao,
    saveAllResponses,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);

  // Use active section management with completedSections
  const {
    activeSecao,
    setActiveSecao,
    isEditingActive,
    toggleEditMode
  } = useActiveSection(secoes, completedSections);

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Use section navigation
  const {
    incompleteSections,
    getPerguntasBySecao,
    updateIncompleteSections,
    goToNextSection,
    goToPreviousSection
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas,
    activeSecao,
    setActiveSecao
  });

  // Carregar respostas quando o componente montar ou quando mudar de seção
  useEffect(() => {
    if (respostasExistentes && respostasExistentes.length > 0) {
      console.log("Processando respostas existentes...");
      
      // Mapear respostas existentes para o formato esperado
      const respostasMap: Record<string, any> = {};
      
      // Ordenar respostas por data (mais recentes primeiro)
      const respostasOrdenadas = [...respostasExistentes].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Mapa para controlar perguntas já processadas
      const perguntasProcessadas = new Map();
      
      respostasOrdenadas.forEach(resposta => {
        if (!perguntasProcessadas.has(resposta.pergunta_id)) {
          respostasMap[resposta.pergunta_id] = resposta.resposta;
          perguntasProcessadas.set(resposta.pergunta_id, true);
        }
      });
      
      console.log("Respostas mapeadas:", respostasMap);
      setRespostas(respostasMap);
    }
  }, [respostasExistentes, setRespostas]);

  // Função wrapper garantindo retorno booleano explícito
  const saveAllAndReturnBoolean = async (respostasExistentes: any[]): Promise<boolean> => {
    try {
      await saveAllResponses();
      console.log("saveAllAndReturnBoolean: respostas salvas com sucesso");
      return true;
    } catch (error) {
      console.error("Error in saveAllAndReturnBoolean:", error);
      return false;
    }
  };

  // Use save progress functionality
  const {
    saveAndNavigateHome: saveAndNavigateHomeBase
  } = useSaveProgress(
    saveAllResponses,
    saveAllAndReturnBoolean
  );
  
  // Use response handlers
  const {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  } = useResponseHandlers(
    handleResposta,
    handleFileUpload,
    handleSaveObservacao,
    respostasExistentes,
    perguntas,
    updateIncompleteSections
  );

  // Use navigation handlers
  const {
    handleSetActiveSecao,
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    saveAndNavigateToNextSection
  } = useNavigationHandlers(
    activeSecao,
    setActiveSecao,
    secoes,
    goToNextSection,
    goToPreviousSection,
    saveAllResponses,
    saveAndNavigateHomeBase
  );

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
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode,
    saveAndNavigateHomeBase,
    saveAndNavigateToNextSection
  };
};
