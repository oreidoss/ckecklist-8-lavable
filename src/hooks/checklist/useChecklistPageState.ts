import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useRespostaHandler } from '@/hooks/checklist/useRespostaHandler';
import { useSaveResponses } from '@/hooks/checklist/useSaveResponses';
import { useChecklistScores } from '@/hooks/checklist/useChecklistScores';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [initializingData, setInitializingData] = useState(true);

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

  // Update incomplete sections
  const updateIncompleteSections = useCallback(() => {
    if (!secoes || !perguntas) return;
    
    const incomplete: string[] = [];
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      if (secaoPerguntas.length > 0 && 
          secaoPerguntas.some(p => !respostas[p.id])) {
        incomplete.push(secao.id);
      }
    });
    
    setIncompleteSections(incomplete);
  }, [secoes, perguntas, respostas]);

  // Update completed sections
  const updateCompletedSections = useCallback(() => {
    if (!secoes || !perguntas) return;
    
    const completed: string[] = [];
    
    secoes.forEach(secao => {
      const secaoPerguntas = perguntas.filter(p => p.secao_id === secao.id);
      if (secaoPerguntas.length > 0 && 
          secaoPerguntas.every(p => respostas[p.id])) {
        completed.push(secao.id);
      }
    });
    
    setCompletedSections(completed);
  }, [secoes, perguntas, respostas]);

  // Manage section state
  const { 
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
  } = useSectionManagement(secoes, completedSections);

  // Get pergunta by secao
  const getPerguntasBySecao = useCallback((secaoId: string) => {
    return perguntas?.filter(p => p.secao_id === secaoId) || [];
  }, [perguntas]);

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

  // Handle observacao change
  const handleObservacaoChange = useCallback((perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  }, []);

  // Navigation helpers
  const goToPreviousSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex > 0) {
      setActiveSecao(secoes[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao, setActiveSecao]);
  
  const goToNextSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      setActiveSecao(secoes[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao, setActiveSecao]);

  // Helper functions
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    const activePerguntas = perguntas.filter(p => p.secao_id === activeSecao);
    return activePerguntas.some(p => !respostas[p.id]);
  }, [activeSecao, perguntas, respostas]);
  
  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!activeSecao || !perguntas) return false;
    
    const activePerguntas = perguntas.filter(p => p.secao_id === activeSecao);
    if (activePerguntas.length === 0) return false;
    
    return activePerguntas[activePerguntas.length - 1].id === perguntaId;
  }, [activeSecao, perguntas]);

  // Save and navigate
  const saveAndNavigateHome = useCallback(async () => {
    if (respostasExistentes) {
      try {
        await saveAllResponses();
        return true;
      } catch (error) {
        console.error("Error navigating home:", error);
        return false;
      }
    }
    return false;
  }, [respostasExistentes, saveAllResponses]);
  
  const saveAndNavigateToNextSection = useCallback(async () => {
    if (!activeSecao || !secoes) return false;
    
    try {
      // Save responses first
      await saveAllResponses();
      
      // Then navigate to next section
      const currentIndex = secoes.findIndex(s => s.id === activeSecao);
      if (currentIndex < secoes.length - 1) {
        setActiveSecao(secoes[currentIndex + 1].id);
        window.scrollTo(0, 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving and navigating:", error);
      return false;
    }
  }, [activeSecao, secoes, saveAllResponses, setActiveSecao]);

  // Process existing responses on initial load
  useEffect(() => {
    if (respostasExistentes?.length && perguntas?.length) {
      console.log("Processando respostas existentes");
      
      // Create maps for responses, observations, and file URLs
      const respostasMap: Record<string, RespostaValor> = {};
      const observacoesMap: Record<string, string> = {};
      const fileUrlsMap: Record<string, string> = {};
      
      // Use a Map to keep track of the most recent response for each question
      const latestResponses = new Map();
      
      // Sort responses by created_at, newest first
      const sortedRespostas = [...respostasExistentes].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Process responses, keeping only the most recent one for each pergunta_id
      sortedRespostas.forEach(resposta => {
        if (resposta.pergunta_id && !latestResponses.has(resposta.pergunta_id)) {
          latestResponses.set(resposta.pergunta_id, resposta);
          
          // Add to our response maps
          if (resposta.resposta) {
            respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
          }
          
          if (resposta.observacao) {
            observacoesMap[resposta.pergunta_id] = resposta.observacao;
          }
          
          if (resposta.anexo_url) {
            fileUrlsMap[resposta.pergunta_id] = resposta.anexo_url;
          }
        }
      });
      
      console.log("Mapa de respostas processado:", respostasMap);
      
      // Update state
      setRespostas(respostasMap);
      setObservacoes(observacoesMap);
      setFileUrls(fileUrlsMap);
      
      // Calculate progress
      const progresso = perguntas.length > 0 ? 
        (Object.keys(respostasMap).length / perguntas.length) * 100 : 0;
      setProgresso(progresso);
      
      // Update section states
      updateCompletedSections();
      updateIncompleteSections();
      
      setInitializingData(false);
    }
  }, [respostasExistentes, perguntas, updateCompletedSections, updateIncompleteSections]);

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
    setEditingSections,
    
    // Setters
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    
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
    saveAndNavigateHomeBase: saveAndNavigateHome,
    saveAllResponses,
    updateCompletedSections,
    toggleEditMode,
    saveAndNavigateToNextSection
  };
};
