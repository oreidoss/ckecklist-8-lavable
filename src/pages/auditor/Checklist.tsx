
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import SectionScores from '@/components/checklist/SectionScores';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = useState<Record<string, number>>({});
  
  // Use our hooks to manage state
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
    
    respostas,
    activeSecao,
    progresso,
    completedSections,
    incompleteSections,
    observacoes,
    uploading,
    fileUrls,
    isSaving,
    
    setSupervisor,
    setGerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    
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
    saveAndNavigateToNextSection
  } = useChecklistPageState(auditoriaId, setPontuacaoPorSecao);
  
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

  return (
    <>
      {/* Component to handle section score calculations */}
      <SectionScores 
        auditoriaId={auditoriaId}
        secoes={secoes}
        respostasExistentes={respostasExistentes}
        setPontuacaoPorSecao={setPontuacaoPorSecao}
      />
      
      {/* Main checklist container component */}
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
        saveAllResponses={saveAllResponses}
        pontuacaoPorSecao={pontuacaoPorSecao}
        saveAndNavigateToNextSection={saveAndNavigateToNextSection}
      />
    </>
  );
};

export default Checklist;
