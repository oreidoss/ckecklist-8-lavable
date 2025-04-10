
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionManagement } from '@/hooks/checklist/useSectionManagement';
import { useChecklistNavigation } from '@/hooks/checklist/useChecklistNavigation';
import { useChecklistResponses } from '@/hooks/checklist/useChecklistResponses';
import { useChecklistProcessor } from '@/hooks/checklist/useChecklistProcessor';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import { useResponseHandlers } from '@/hooks/checklist/useResponseHandlers';
import { perguntaService } from '@/lib/services/perguntaService';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook that combines all the checklist state management for the Checklist page
 */
export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const toast = useToast();
  const [initializingData, setInitializingData] = useState(true);
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  
  // Carregar perguntas do Supabase ao inicializar
  useEffect(() => {
    const loadPerguntas = async () => {
      try {
        await perguntaService.fetchPerguntasFromSupabase();
        console.log('Perguntas carregadas do Supabase');
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
      } finally {
        setInitializingData(false);
      }
    };
    
    loadPerguntas();
  }, []);
  
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
    isLoading: dataLoading,
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    refetchAuditoria
  } = dataState;

  console.log("respostasExistentes:", respostasExistentes);
  console.log("perguntas:", perguntas);
  
  // Section and editing state management - passing an empty array initially
  const { 
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
    getPerguntasBySecao
  } = useSectionManagement(secoes, []);

  // Definir updateIncompleteSections para uso com handleRespostaWrapped
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
    console.log("Seções incompletas atualizadas:", incomplete);
  }, [secoes, perguntas, respostas]);

  // Definir updateCompletedSections 
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
    console.log("Seções completas atualizadas:", completed);
  }, [secoes, perguntas, respostas]);

  // Função mock para updatePontuacaoPorSecao
  const updatePontuacaoPorSecao = useCallback(async () => {
    console.log("Atualizando pontuação por seção");
    // Implementação real seria feita aqui
    return Promise.resolve();
  }, []);

  // Mock basic implementations for response handling
  const handleRespostaBase = useCallback((perguntaId: string, resposta: RespostaValor, respostasExistentes: any[] = [], perguntas?: any[]) => {
    console.log(`Chamando handleRespostaBase para pergunta ${perguntaId} com resposta ${resposta}`);
    
    // Atualiza o estado de respostas localmente
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: resposta
    }));
    
    // Aqui normalmente salvaríamos no banco de dados
    // Esta é uma versão simplificada, apenas para demonstração
    
    // Atualizar progresso
    if (perguntas && perguntas.length > 0) {
      const newRespostas = {
        ...respostas,
        [perguntaId]: resposta
      };
      const totalRespondidas = Object.keys(newRespostas).length;
      const novoProgresso = (totalRespondidas / perguntas.length) * 100;
      setProgresso(novoProgresso);
    }
  }, [respostas]);
  
  const handleFileUploadBase = useCallback((perguntaId: string, file: File, respostasExistentes: any[]) => {
    console.log(`Upload de arquivo para pergunta ${perguntaId}`);
    // Implementação simplificada
    setUploading(prev => ({ ...prev, [perguntaId]: true }));
    
    // Simular conclusão do upload
    setTimeout(() => {
      setUploading(prev => ({ ...prev, [perguntaId]: false }));
      setFileUrls(prev => ({ ...prev, [perguntaId]: URL.createObjectURL(file) }));
    }, 1000);
  }, []);
  
  const handleObservacaoChange = useCallback((perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  }, []);
  
  const handleSaveObservacaoBase = useCallback((perguntaId: string, respostasExistentes: any[]) => {
    console.log(`Salvando observação para pergunta ${perguntaId}`);
    // Aqui implementaríamos o salvamento no banco de dados
    // Esta é uma versão simplificada
  }, []);

  // Use response handlers
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

  // Helpers for checklist operations
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
  
  const getActiveQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    return perguntas.filter(p => p.secao_id === activeSecao).length;
  }, [activeSecao, perguntas]);
  
  const getAnsweredQuestionCount = useCallback(() => {
    if (!activeSecao || !perguntas) return 0;
    
    const activePerguntas = perguntas.filter(p => p.secao_id === activeSecao);
    return activePerguntas.filter(p => respostas[p.id]).length;
  }, [activeSecao, perguntas, respostas]);

  // Mock implementations for save functions
  const saveAllResponses = useCallback(async () => {
    console.log("Salvando todas as respostas");
    return Promise.resolve();
  }, []);
  
  const saveAndNavigateHome = useCallback(async () => {
    console.log("Salvando e navegando para home");
    return true;
  }, []);

  const saveAndNavigateToNextSection = useCallback(async () => {
    if (!activeSecao || !secoes) return false;
    
    console.log("Salvando e navegando para próxima seção");
    
    // Desabilitar edição para seção atual
    setEditingSections(prev => ({
      ...prev,
      [activeSecao]: false
    }));
    
    // Navegar para próxima seção
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      const nextSecaoId = secoes[currentIndex + 1].id;
      setActiveSecao(nextSecaoId);
      window.scrollTo(0, 0);
      return true;
    }
    
    return false;
  }, [activeSecao, secoes, setEditingSections, setActiveSecao]);

  // Process existing responses on initial load
  useEffect(() => {
    if (!initializingData && respostasExistentes?.length && perguntas?.length) {
      console.log("Processando respostas existentes");
      
      // Criar um mapa de respostas existentes
      const respostasMap: Record<string, RespostaValor> = {};
      const observacoesMap: Record<string, string> = {};
      const fileUrlsMap: Record<string, string> = {};
      
      respostasExistentes.forEach(resposta => {
        if (resposta.pergunta_id) {
          respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
          
          if (resposta.observacao) {
            observacoesMap[resposta.pergunta_id] = resposta.observacao;
          }
          
          if (resposta.anexo_url) {
            fileUrlsMap[resposta.pergunta_id] = resposta.anexo_url;
          }
        }
      });
      
      console.log("Mapa de respostas:", respostasMap);
      
      // Atualizar estados
      setRespostas(respostasMap);
      setObservacoes(observacoesMap);
      setFileUrls(fileUrlsMap);
      
      // Calcular progresso
      const progresso = perguntas.length > 0 ? 
        (Object.keys(respostasMap).length / perguntas.length) * 100 : 0;
      setProgresso(progresso);
      
      // Atualizar seções completas
      updateCompletedSections();
      updateIncompleteSections();
    }
  }, [respostasExistentes, perguntas, initializingData, updateCompletedSections, updateIncompleteSections]);

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
  
  // Combine isSaving states
  const isSaving = false; // Simplified for now

  console.log("Estado atual - respostas:", respostas);
  console.log("Estado atual - isEditingActive:", isEditingActive);
  console.log("Estado atual - activeSecao:", activeSecao);

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
