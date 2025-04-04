
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklist } from '@/hooks/checklist';
import { useChecklistData } from '@/hooks/checklist/useChecklistData';
import { useSectionNavigation } from '@/hooks/checklist/useSectionNavigation';
import useUserSelectors from '@/components/checklist/UserSelectors';
import ChecklistHeader from '@/components/checklist/ChecklistHeader';
import SectionNavigation from '@/components/checklist/SectionNavigation';
import SectionContent from '@/components/checklist/SectionContent';

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
  } = useChecklist(auditoriaId, undefined);
  
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

  const navigateToReport = () => {
    if (!auditoriaId) return;
    navigate(`/relatorio/${auditoriaId}`);
  };
  
  const isLastPerguntaInSection = (perguntaId: string) => {
    if (!perguntas) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  const activeSecaoObj = secoes?.find(s => s.id === activeSecao);
  const perguntasSecaoAtiva = getPerguntasBySecao(activeSecao || '');
  const secaoIndex = secoes?.findIndex(s => s.id === activeSecao) || 0;
  const totalSecoes = secoes?.length || 0;
  const isFirstSection = secaoIndex === 0;
  const isLastSection = secaoIndex === totalSecoes - 1;

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <ChecklistHeader
        lojaName={auditoria?.loja?.nome || ''}
        lojaNumero={auditoria?.loja?.numero || ''}
        progresso={progresso}
        currentDate={currentDate}
        supervisor={supervisor}
        gerente={gerente}
        isEditingSupervisor={isEditingSupervisor}
        isEditingGerente={isEditingGerente}
        usuarios={usuarios || []}
        setIsEditingSupervisor={setIsEditingSupervisor}
        setIsEditingGerente={setIsEditingGerente}
        setSupervisor={setSupervisor}
        setGerente={setGerente}
        handleSaveSupervisor={handleSaveSupervisor}
        handleSaveGerente={handleSaveGerente}
      />
      
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <SectionNavigation
          secoes={secoes || []}
          activeSecao={activeSecao}
          completedSections={completedSections}
          incompleteSections={incompleteSections}
          setActiveSecao={handleSetActiveSecao}
        />
      </div>
      
      {activeSecaoObj && (
        <SectionContent
          activeSecaoObj={activeSecaoObj}
          secaoIndex={secaoIndex}
          totalSecoes={totalSecoes}
          perguntasSecaoAtiva={perguntasSecaoAtiva}
          respostas={respostas}
          observacoes={observacoes}
          fileUrls={fileUrls}
          uploading={uploading}
          respostasExistentes={respostasExistentes}
          isFirstSection={isFirstSection}
          isLastSection={isLastSection}
          goToPreviousSection={goToPreviousSection}
          goToNextSection={goToNextSection}
          handleResposta={handleRespostaWrapped}
          handleObservacaoChange={handleObservacaoChange}
          handleSaveObservacao={handleSaveObservacaoWrapped}
          handleFileUpload={handleFileUploadWrapped}
          isLastPerguntaInSection={isLastPerguntaInSection}
          saveAndNavigateHome={saveAndNavigateHome}
          navigateToReport={navigateToReport}
          isSaving={isSaving}
        />
      )}
      
      <div className="mt-6 text-center">
        <Button variant="outline" asChild className="border-[#00bfa5] text-[#00bfa5]">
          <Link to="/" className="flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            Voltar para lojas
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Checklist;
