
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import { analiseService } from '@/lib/services/analiseService';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = useState<Record<string, number>>({});
  
  // Use our new hooks to manage state
  const {
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
    saveAndNavigateHomeBase
  } = useChecklistPageState(auditoriaId);
  
  // User selector handlers
  const {
    handleSaveSupervisor,
    handleSaveGerente
  } = useUserSelectorHandlers({
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

  const saveAndNavigateHome = async () => {
    if (respostasExistentes) {
      const success = await saveAndNavigateHomeBase(respostasExistentes);
      if (success) {
        navigate('/');
      }
    }
  };

  // Calculate section scores when respostas change
  useEffect(() => {
    if (auditoriaId) {
      const scores = analiseService.calcularPontuacaoPorSecao(auditoriaId);
      console.log("Calculated scores:", scores);
      setPontuacaoPorSecao(scores);
    }
  }, [auditoriaId, respostas, respostasExistentes]);

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
      pontuacaoPorSecao={pontuacaoPorSecao}
    />
  );
};

export default Checklist;
