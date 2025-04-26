
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import SectionScores from '@/components/checklist/SectionScores';
import { useToast } from '@/hooks/use-toast';

const ChecklistPage: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const { toast } = useToast();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = useState<Record<string, number>>({});

  // Use main state management hook
  const checklistState = useChecklistPageState(auditoriaId, setPontuacaoPorSecao);
  
  // User selector handlers
  const userHandlers = useUserSelectorHandlers({
    auditoriaId,
    supervisor: checklistState.supervisor,
    gerente: checklistState.gerente,
    isEditingSupervisor: checklistState.isEditingSupervisor,
    isEditingGerente: checklistState.isEditingGerente,
    usuarios: checklistState.usuarios || [],
    setIsEditingSupervisor: checklistState.setIsEditingSupervisor,
    setIsEditingGerente: checklistState.setIsEditingGerente,
    setSupervisor: checklistState.setSupervisor,
    setGerente: checklistState.setGerente,
    refetchAuditoria: checklistState.refetchAuditoria
  });

  return (
    <>
      <SectionScores 
        auditoriaId={auditoriaId}
        secoes={checklistState.secoes}
        respostasExistentes={checklistState.respostasExistentes}
        setPontuacaoPorSecao={setPontuacaoPorSecao}
      />
      
      <ChecklistContainer
        isLoading={checklistState.isLoading}
        auditoria={checklistState.auditoria}
        secoes={checklistState.secoes}
        perguntas={checklistState.perguntas}
        respostas={checklistState.respostas}
        observacoes={checklistState.observacoes}
        uploading={checklistState.uploading}
        fileUrls={checklistState.fileUrls}
        respostasExistentes={checklistState.respostasExistentes}
        supervisor={checklistState.supervisor}
        gerente={checklistState.gerente}
        isEditingSupervisor={checklistState.isEditingSupervisor}
        isEditingGerente={checklistState.isEditingGerente}
        currentDate={checklistState.currentDate}
        activeSecao={checklistState.activeSecao}
        progresso={checklistState.progresso}
        completedSections={checklistState.completedSections}
        incompleteSections={checklistState.incompleteSections}
        isSaving={checklistState.isSaving}
        isSendingEmail={checklistState.isSendingEmail}
        isEditingActive={checklistState.isEditingActive}
        toggleEditMode={checklistState.toggleEditMode}
        usuarios={checklistState.usuarios || []}
        setIsEditingSupervisor={checklistState.setIsEditingSupervisor}
        setIsEditingGerente={checklistState.setIsEditingGerente}
        setSupervisor={checklistState.setSupervisor}
        setGerente={checklistState.setGerente}
        handleSaveSupervisor={userHandlers.handleSaveSupervisor}
        handleSaveGerente={userHandlers.handleSaveGerente}
        getPerguntasBySecao={checklistState.getPerguntasBySecao}
        handleSetActiveSecao={checklistState.handleSetActiveSecao}
        handleResposta={checklistState.handleRespostaWrapped}
        handleObservacaoChange={checklistState.handleObservacaoChange}
        handleSaveObservacao={checklistState.handleSaveObservacaoWrapped}
        handleFileUpload={checklistState.handleFileUploadWrapped}
        goToPreviousSection={checklistState.goToPreviousSection}
        goToNextSection={checklistState.goToNextSection}
        hasUnansweredQuestions={checklistState.hasUnansweredQuestions}
        isLastPerguntaInSection={checklistState.isLastPerguntaInSection}
        saveAndNavigateHome={checklistState.saveAndNavigateHomeBase}
        saveAllResponses={checklistState.saveAllResponses}
        pontuacaoPorSecao={pontuacaoPorSecao}
        saveAndNavigateToNextSection={checklistState.saveAndNavigateToNextSection}
      />
    </>
  );
};

export default ChecklistPage;
