
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import SectionScores from '@/components/checklist/SectionScores';
import { useToast } from '@/hooks/use-toast';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    isSendingEmail,
    isEditingActive,
    
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
    updateCompletedSections,
    toggleEditMode,
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
      try {
        console.log("Iniciando saveAndNavigateHome com", respostasExistentes.length, "respostas");
        console.log("Verificando parâmetros:", { auditoriaId, auditoria });
        
        // Checar se temos os dados necessários
        if (!auditoriaId) {
          console.error("auditoriaId não definido");
          toast({
            title: "Erro",
            description: "ID da auditoria não encontrado. Por favor, recarregue a página.",
            variant: "destructive"
          });
          return false;
        }
        
        if (!auditoria?.loja) {
          console.error("Dados da loja não encontrados");
          toast({
            title: "Erro",
            description: "Dados da loja não encontrados. Por favor, recarregue a página.",
            variant: "destructive"
          });
          return false;
        }
        
        // Chamar a função base com os parâmetros corretos
        const success = await saveAndNavigateHomeBase(respostasExistentes);
        console.log("saveAndNavigateHome resultado:", success);
        
        if (success) {
          console.log("Navegando para home após salvar");
          navigate('/');
        } else {
          console.log("Não navegando: success é", success);
        }
        return success;
      } catch (error: any) {
        console.error("Erro ao salvar e navegar:", error);
        console.error("Stack trace:", error.stack);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o checklist: " + (error.message || "erro desconhecido"),
          variant: "destructive"
        });
        return false;
      }
    } else {
      console.log("Nenhuma resposta existente para salvar");
      toast({
        title: "Alerta",
        description: "Não há respostas para salvar.",
        variant: "destructive"
      });
      return false;
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
        isSendingEmail={isSendingEmail}
        isEditingActive={isEditingActive}
        toggleEditMode={toggleEditMode}
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
