
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import ChecklistContainer from '@/components/checklist/ChecklistContainer';
import { analiseService } from '@/lib/services/analiseService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
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
    if (!auditoriaId) {
      console.log("No auditoriaId provided, can't update scores");
      return;
    }
    
    console.log("Updating section scores for auditoria:", auditoriaId);
    
    try {
      // Direct Supabase query for more accurate score calculation
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;
      console.log(`Found ${respostasData?.length || 0} responses for this auditoria`);

      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      console.log(`Found ${perguntasData?.length || 0} total questions`);
      
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
      
      // Log each resposta for debugging
      respostasData.forEach(resposta => {
        const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.secao_id) {
          const secaoId = pergunta.secao_id;
          // Get section name for better logging
          const secao = secoes?.find(s => s.id === secaoId);
          const secaoNome = secao ? secao.nome : 'unknown section';
          
          console.log(`Processing resposta for secao "${secaoNome}" (${secaoId}):`, {
            pergunta_id: resposta.pergunta_id,
            resposta: resposta.resposta,
            pontuacao_obtida: resposta.pontuacao_obtida
          });
          
          // Use the pontuacao_obtida if available, otherwise calculate from resposta
          if (resposta.pontuacao_obtida !== null && resposta.pontuacao_obtida !== undefined) {
            const pontuacao = Number(resposta.pontuacao_obtida);
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Added pontuacao_obtida ${pontuacao} to secao "${secaoNome}", new total: ${scores[secaoId]}`);
          } else if (resposta.resposta) {
            const pontuacao = pontuacaoMap[resposta.resposta] || 0;
            scores[secaoId] = (scores[secaoId] || 0) + pontuacao;
            console.log(`  Calculated pontuacao ${pontuacao} from resposta "${resposta.resposta}" for secao "${secaoNome}", new total: ${scores[secaoId]}`);
          }
        }
      });
      
      console.log("Final calculated scores:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Error calculating scores directly:", error);
      
      // Show error toast
      toast({
        title: "Erro ao calcular pontuações",
        description: "Ocorreu um erro ao calcular as pontuações das seções.",
        variant: "destructive"
      });
    }
  };

  // Calculate section scores when component mounts
  useEffect(() => {
    console.log("Initial load - updating section scores");
    updateSectionScores();
  }, [auditoriaId]);

  // Recalculate scores when responses change
  useEffect(() => {
    if (respostasExistentes?.length) {
      console.log("Responses changed - updating section scores");
      updateSectionScores();
    }
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
