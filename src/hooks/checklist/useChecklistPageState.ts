
import { useEffect } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useChecklist } from '@/hooks/checklist';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';

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
    handleResposta: handleRespostaBase,
    handleFileUpload: handleFileUploadBase,
    handleObservacaoChange,
    handleSaveObservacao: handleSaveObservacaoBase,
    saveAndNavigateHome: saveAndNavigateHomeBase,
    saveAllResponses: saveAllResponsesBase,
    updateCompletedSections
  } = useChecklist(auditoriaId, perguntas, setPontuacaoPorSecao);
  
  // Section navigation
  const {
    activeSecao,
    setActiveSecao,
    incompleteSections,
    setIncompleteSections,
    getPerguntasBySecao,
    updateIncompleteSections,
    goToNextSection,
    goToPreviousSection,
    handleSetActiveSecao
  } = useSectionNavigation({
    secoes,
    perguntas,
    respostas
  });

  // Helpers for checklist operations
  const { hasUnansweredQuestions, isLastPerguntaInSection } = useChecklistHelpers(
    perguntas,
    respostas,
    activeSecao
  );

  // Wrapped handlers
  const handleRespostaWrapped = (perguntaId: string, resposta: RespostaValor) => {
    if (respostasExistentes && perguntas) {
      handleRespostaBase(perguntaId, resposta, respostasExistentes, perguntas);
      updateIncompleteSections();
    }
  };

  const handleFileUploadWrapped = (perguntaId: string, file: File) => {
    if (respostasExistentes) {
      handleFileUploadBase(perguntaId, file, respostasExistentes);
    }
  };

  const handleSaveObservacaoWrapped = (perguntaId: string) => {
    if (respostasExistentes) {
      handleSaveObservacaoBase(perguntaId, respostasExistentes);
    }
  };
  
  const saveAllResponses = async () => {
    if (respostasExistentes) {
      return saveAllResponsesBase(respostasExistentes);
    }
    return Promise.resolve();
  };
  
  // Process existing responses - only on initial load
  useEffect(() => {
    if (!respostasExistentes?.length || !perguntas?.length || !secoes?.length) return;
    
    // Skip this effect if we already have respostas
    if (Object.keys(respostas).length > 0) return;
    
    const respostasMap: Record<string, RespostaValor> = {};
    respostasExistentes.forEach(resposta => {
      if (resposta.pergunta_id && resposta.resposta) {
        respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
      }
    });
    
    setRespostas(respostasMap);
    
    const progresso = (Object.keys(respostasMap).length / perguntas.length) * 100;
    setProgresso(progresso);
    
    const completedSections: string[] = [];
    
    secoes.forEach(secao => {
      const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
      const todasRespondidas = perguntasSecao.every(pergunta => 
        respostasExistentes.some(resp => resp.pergunta_id === pergunta.id)
      );
      
      if (todasRespondidas && perguntasSecao.length > 0) {
        completedSections.push(secao.id);
      }
    });
    
    setCompletedSections(completedSections);
    updateIncompleteSections();
    
  }, [respostasExistentes, perguntas, secoes]);
  
  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao, setActiveSecao]);

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
    updateCompletedSections
  };
};
