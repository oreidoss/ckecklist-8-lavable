import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import { analiseService } from '@/lib/services/analiseService';
import { supabase } from '@/integrations/supabase/client';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = useState<Record<string, number>>({});
  
  // Use our new hooks to manage state
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
    saveAllResponses
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

  // Calculate and update section scores when responses change
  const updateSectionScores = async () => {
    if (auditoriaId) {
      try {
        // Direct Supabase query for more accurate score calculation
        const { data: respostasData, error: respostasError } = await supabase
          .from('respostas')
          .select('*')
          .eq('auditoria_id', auditoriaId);
          
        if (respostasError) throw respostasError;

        const { data: perguntasData, error: perguntasError } = await supabase
          .from('perguntas')
          .select('*');
          
        if (perguntasError) throw perguntasError;
        
        // Calculate scores directly
        const scores: Record<string, number> = {};
        
        // Initialize all section scores to 0
        perguntasData.forEach(pergunta => {
          if (pergunta.secao_id && !scores[pergunta.secao_id]) {
            scores[pergunta.secao_id] = 0;
          }
        });
        
        // Direct scoring from responses
        const pontuacaoMap: Record<string, number> = {
          'Sim': 1,
          'Não': -1,
          'Regular': 0.5,
          'N/A': 0
        };
        
        respostasData.forEach(resposta => {
          const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
          if (pergunta && pergunta.secao_id) {
            const secaoId = pergunta.secao_id;
            // Use the pontuacao_obtida if available, otherwise calculate from resposta
            if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
              scores[secaoId] = (scores[secaoId] || 0) + resposta.pontuacao_obtida;
            } else if (resposta.resposta) {
              const pontuacao = pontuacaoMap[resposta.resposta] || 0;
              scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            }
          }
        });
        
        console.log("Direct calculated scores:", scores);
        setPontuacaoPorSecao(scores);
      } catch (error) {
        console.error("Error calculating scores directly:", error);
        
        // Fallback to using the service
        try {
          const scores = await analiseService.calcularPontuacaoPorSecaoSupabase(auditoriaId);
          console.log("Service calculated scores:", scores);
          setPontuacaoPorSecao(scores);
        } catch (serviceError) {
          console.error("Error with service calculation:", serviceError);
          
          // Last resort - local calculation
          const scores = analiseService.calcularPontuacaoPorSecao(auditoriaId);
          console.log("Local calculated scores:", scores);
          setPontuacaoPorSecao(scores);
        }
      }
    }
  };

  // Calculate section scores when component mounts
  useEffect(() => {
    updateSectionScores();
  }, [auditoriaId]);

  // Recalculate scores when responses change
  useEffect(() => {
    updateSectionScores();
  }, [respostas, respostasExistentes]);

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
      saveAllResponses={saveAllResponses}
      pontuacaoPorSecao={pontuacaoPorSecao}
    />
  );
};

export default Checklist;
