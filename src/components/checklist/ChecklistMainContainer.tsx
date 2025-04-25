
import React from 'react';
import { useChecklist } from '@/contexts/ChecklistContext';
import ChecklistContainer from './ChecklistContainer';

const ChecklistMainContainer: React.FC = () => {
  const { 
    auditoriaId,
    pageState,
    userHandlers,
    saveAndNavigateHome
  } = useChecklist();
  
  if (pageState.isLoading) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }

  return (
    <ChecklistContainer
      isLoading={pageState.isLoading}
      auditoria={pageState.auditoria}
      secoes={pageState.secoes}
      perguntas={pageState.perguntas}
      respostas={pageState.respostas}
      observacoes={pageState.observacoes}
      uploading={pageState.uploading}
      fileUrls={pageState.fileUrls}
      respostasExistentes={pageState.respostasExistentes}
      supervisor={pageState.supervisor}
      gerente={pageState.gerente}
      isEditingSupervisor={pageState.isEditingSupervisor}
      isEditingGerente={pageState.isEditingGerente}
      currentDate={pageState.currentDate}
      activeSecao={pageState.activeSecao}
      progresso={pageState.progresso}
      completedSections={pageState.completedSections}
      incompleteSections={pageState.incompleteSections}
      isSaving={pageState.isSaving}
      isSendingEmail={pageState.isSendingEmail}
      isEditingActive={pageState.isEditingActive}
      toggleEditMode={pageState.toggleEditMode}
      usuarios={pageState.usuarios || []}
      setIsEditingSupervisor={pageState.setIsEditingSupervisor}
      setIsEditingGerente={pageState.setIsEditingGerente}
      setSupervisor={pageState.setSupervisor}
      setGerente={pageState.setGerente}
      handleSaveSupervisor={userHandlers.handleSaveSupervisor}
      handleSaveGerente={userHandlers.handleSaveGerente}
      getPerguntasBySecao={pageState.getPerguntasBySecao}
      handleSetActiveSecao={pageState.handleSetActiveSecao}
      handleResposta={pageState.handleRespostaWrapped}
      handleObservacaoChange={pageState.handleObservacaoChange}
      handleSaveObservacao={pageState.handleSaveObservacaoWrapped}
      handleFileUpload={pageState.handleFileUploadWrapped}
      goToPreviousSection={pageState.goToPreviousSection}
      goToNextSection={pageState.goToNextSection}
      hasUnansweredQuestions={pageState.hasUnansweredQuestions}
      isLastPerguntaInSection={pageState.isLastPerguntaInSection}
      saveAndNavigateHome={saveAndNavigateHome}
      saveAllResponses={pageState.saveAllResponses}
      pontuacaoPorSecao={pageState.pontuacaoPorSecao}
      saveAndNavigateToNextSection={pageState.saveAndNavigateToNextSection}
    />
  );
};

export default ChecklistMainContainer;
