
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Home, List } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useChecklist } from '@/hooks/useChecklist';
import ChecklistHeader from '@/components/checklist/ChecklistHeader';
import SectionNavigation from '@/components/checklist/SectionNavigation';
import SectionContent from '@/components/checklist/SectionContent';

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Secao = Database['public']['Tables']['secoes']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];
type Resposta = Database['public']['Tables']['respostas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [isEditingGerente, setIsEditingGerente] = useState(false);
  const [supervisor, setSupervisor] = useState('');
  const [gerente, setGerente] = useState('');
  
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

  // Wrap the hook functions to pass in the required respostasExistentes parameter
  const handleRespostaWrapped = (perguntaId: string, resposta: RespostaValor) => {
    if (respostasExistentes) {
      handleRespostaBase(perguntaId, resposta, respostasExistentes);
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
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('pt-BR'));
  }, []);
  
  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: auditoria, isLoading: loadingAuditoria, refetch: refetchAuditoria } = useQuery({
    queryKey: ['auditoria', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
      
      const { data, error } = await supabase
        .from('auditorias')
        .select('*, loja:lojas(*), usuario:usuarios(*)')
        .eq('id', auditoriaId)
        .single();
      
      if (error) throw error;
      return data as Auditoria;
    },
    meta: {
      onSuccess: (data) => {
        if (data) {
          setSupervisor(data.supervisor || '');
          setGerente(data.gerente || '');
        }
      }
    }
  });
  
  const { data: secoes, isLoading: loadingSecoes } = useQuery({
    queryKey: ['secoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as Secao[];
    },
    meta: {
      onSuccess: (data: Secao[]) => {
        if (data?.length && activeSecao === null) {
          setActiveSecao(data[0].id);
        }
      }
    }
  });
  
  const { data: perguntas, isLoading: loadingPerguntas } = useQuery({
    queryKey: ['perguntas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .order('secao_id, id');
      
      if (error) throw error;
      return data as Pergunta[];
    }
  });
  
  const { data: respostasExistentes, isLoading: loadingRespostas } = useQuery({
    queryKey: ['respostas', auditoriaId],
    queryFn: async () => {
      if (!auditoriaId) throw new Error('ID da auditoria não fornecido');
      
      const { data, error } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
      
      if (error) throw error;
      return data as Resposta[];
    }
  });
  
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
      }
    }
  }, [respostasExistentes, perguntas, secoes, setRespostas, setProgresso, setCompletedSections]);
  
  const handleSaveSupervisor = async () => {
    if (!auditoriaId) return;
    
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({ supervisor })
        .eq('id', auditoriaId);
      
      if (error) throw error;
      
      setIsEditingSupervisor(false);
      refetchAuditoria();
      
      toast({
        title: "Supervisor(a) atualizado(a)",
        description: "Nome do supervisor(a) foi salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar supervisor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o nome do supervisor(a).",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveGerente = async () => {
    if (!auditoriaId) return;
    
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({ gerente })
        .eq('id', auditoriaId);
      
      if (error) throw error;
      
      setIsEditingGerente(false);
      refetchAuditoria();
      
      toast({
        title: "Gerente atualizado(a)",
        description: "Nome do gerente foi salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar gerente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o nome do gerente.",
        variant: "destructive"
      });
    }
  };
  
  const getPerguntasBySecao = (secaoId: string) => {
    return perguntas?.filter(pergunta => pergunta.secao_id === secaoId) || [];
  };

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

  const goToNextSection = () => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      setActiveSecao(secoes[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousSection = () => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex > 0) {
      setActiveSecao(secoes[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };
  
  if (loadingAuditoria || loadingUsuarios) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  const activeSecaoObj = secoes?.find(s => s.id === activeSecao);
  const perguntasSecaoAtiva = getPerguntasBySecao(activeSecao || '');
  const secaoIndex = secoes?.findIndex(s => s.id === activeSecao) || 0;
  const totalSecoes = secoes?.length || 0;
  const isFirstSection = secaoIndex === 0;
  const isLastSection = secaoIndex === totalSecoes - 1;
  
  const isLastPerguntaInSection = (perguntaId: string) => {
    if (!perguntas) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  };

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
          setActiveSecao={setActiveSecao}
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
