
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklist } from '@/hooks/checklist';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import { useChecklistHelpers } from '@/hooks/checklist/useChecklistHelpers';
import useUserSelectors from '@/components/checklist/UserSelectors';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  
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
    saveAndNavigateHome: saveAndNavigateHomeBase
  } = useChecklist(auditoriaId, perguntas);
  
  // Section navigation
  const {
    activeSecao,
    setActiveSecao,
    incompleteSections,
    updateIncompleteSections,
    getPerguntasBySecao,
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
  
  // User selectors handlers
  const {
    handleSaveSupervisor,
    handleSaveGerente
  } = useUserSelectors({
    auditoriaId, 
    supervisor, 
    gerente, 
    isEditingSupervisor, 
    isEditingGerente, 
    usuarios: usuarios || [], 
    setIsEditingSupervisor, 
    setIsEditingGerente, 
    setSupervisor, 
    setGerente,
    refetchAuditoria
  });

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
  
  // Process existing responses
  useEffect(() => {
    if (respostasExistentes?.length && perguntas?.length) {
      const respostasMap: Record<string, RespostaValor> = {};
      respostasExistentes.forEach(resposta => {
        if (resposta.pergunta_id && resposta.resposta) {
          respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
        }
      });
      
      setRespostas(respostasMap);
      
      const progresso = (respostasExistentes.length / perguntas.length) * 100;
      setProgresso(progresso);
      
      const completedSections: string[] = [];
      
      if (secoes && perguntas) {
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
      }
    }
  }, [respostasExistentes, perguntas, secoes, setRespostas, setProgresso, setCompletedSections, updateIncompleteSections]);
  
  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao, setActiveSecao]);

  const saveAndNavigateHome = async () => {
    if (respostasExistentes) {
      const success = await saveAndNavigateHomeBase(respostasExistentes);
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <ChecklistContainer
      isLoading={isLoading}
      auditoria={auditoria}
      secoes={secoes}
      perguntas={perguntas}
      respostas={respostas}
      observacoes={observacoes}
      uploading={uploading}
      fileUrls={fileUrls}
      respostasExistentes={respostasExistentes}
      supervisor={supervisor}
      gerente={gerente}
      isEditingSupervisor={isEditingSupervisor}
      isEditingGerente={isEditingGerente}
      currentDate={currentDate}
      activeSecao={activeSecao}
      progresso={progresso}
      completedSections={completedSections}
      incompleteSections={incompleteSections}
      isSaving={isSaving}
      usuarios={usuarios || []}
      setIsEditingSupervisor={setIsEditingSupervisor}
      setIsEditingGerente={setIsEditingGerente}
      setSupervisor={setSupervisor}
      setGerente={setGerente}
      handleSaveSupervisor={handleSaveSupervisor}
      handleSaveGerente={handleSaveGerente}
      getPerguntasBySecao={getPerguntasBySecao}
      handleSetActiveSecao={handleSetActiveSecao}
      handleResposta={handleRespostaWrapped}
      handleObservacaoChange={handleObservacaoChange}
      handleSaveObservacao={handleSaveObservacaoWrapped}
      handleFileUpload={handleFileUploadWrapped}
      goToPreviousSection={goToPreviousSection}
      goToNextSection={goToNextSection}
      hasUnansweredQuestions={hasUnansweredQuestions}
      isLastPerguntaInSection={isLastPerguntaInSection}
      saveAndNavigateHome={saveAndNavigateHome}
    />
  );
};

export default Checklist;
