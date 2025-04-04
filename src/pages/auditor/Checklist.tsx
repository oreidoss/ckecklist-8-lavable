import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Store, List, ChevronLeft, Save, Home, ArrowRight, Check, ArrowLeftCircle, ArrowRightCircle, Edit, UserRound, Upload } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Loja = Database['public']['Tables']['lojas']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Secao = Database['public']['Tables']['secoes']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];
type Resposta = Database['public']['Tables']['respostas']['Row'];
type Auditoria = Database['public']['Tables']['auditorias']['Row'] & {
  loja?: Loja;
  usuario?: Usuario;
};

type RespostaValor = 'Sim' | 'Não' | 'Regular' | 'N/A';

const pontuacaoMap: Record<RespostaValor, number> = {
  'Sim': 1,
  'Não': -1,
  'Regular': 0.5,
  'N/A': 0
};

const Checklist: React.FC = () => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [progresso, setProgresso] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [isEditingGerente, setIsEditingGerente] = useState(false);
  const [supervisor, setSupervisor] = useState('');
  const [gerente, setGerente] = useState('');
  
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  
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
  }, [respostasExistentes, perguntas, secoes]);
  
  const handleResposta = async (perguntaId: string, resposta: RespostaValor) => {
    if (!auditoriaId) return;
    
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: resposta
    }));
    
    const pontuacao = pontuacaoMap[resposta];
    const observacao = observacoes[perguntaId] || '';
    const anexo_url = fileUrls[perguntaId] || '';
    
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          })
          .eq('id', respostaExistente.id);
        
        if (error) {
          console.error("Erro ao atualizar resposta:", error);
          toast({
            title: "Erro ao atualizar resposta",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('respostas')
          .insert({
            auditoria_id: auditoriaId,
            pergunta_id: perguntaId,
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          });
        
        if (error) {
          console.error("Erro ao salvar resposta:", error);
          toast({
            title: "Erro ao salvar resposta",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
      }
      
      if (perguntas?.length) {
        const novasRespostas = {
          ...respostas,
          [perguntaId]: resposta
        };
        
        const novasRespostasCount = Object.keys(novasRespostas).length;
        const progresso = (novasRespostasCount / perguntas.length) * 100;
        setProgresso(progresso);
        
        if (activeSecao && perguntas) {
          const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
          const todasRespondidasSecaoAtiva = perguntasSecaoAtiva.every(p => 
            novasRespostas[p.id] !== undefined
          );
          
          if (todasRespondidasSecaoAtiva && !completedSections.includes(activeSecao)) {
            setCompletedSections(prev => [...prev, activeSecao]);
          }
        }
      }
      
      if (auditoria) {
        let pontuacaoTotal = 0;
        
        respostasExistentes?.forEach(r => {
          if (r.pergunta_id !== perguntaId) {
            pontuacaoTotal += r.pontuacao_obtida || 0;
          }
        });
        
        pontuacaoTotal += pontuacao;
        
        await supabase
          .from('auditorias')
          .update({ 
            pontuacao_total: pontuacaoTotal,
          })
          .eq('id', auditoriaId);
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a resposta.",
        variant: "destructive"
      });
    }
  };
  
  const handleFileUpload = async (perguntaId: string, file: File) => {
    if (!auditoriaId || !file) return;
    
    setUploading(prev => ({ ...prev, [perguntaId]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${auditoriaId}/${perguntaId}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('auditoria-anexos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('auditoria-anexos')
        .getPublicUrl(filePath);
      
      setFileUrls(prev => ({ 
        ...prev, 
        [perguntaId]: publicUrl 
      }));
      
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            anexo_url: publicUrl
          })
          .eq('id', respostaExistente.id);
        
        if (error) throw error;
        
        toast({
          title: "Arquivo enviado",
          description: "O arquivo foi enviado com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [perguntaId]: false }));
    }
  };
  
  const handleObservacaoChange = (perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  };
  
  const handleSaveObservacao = async (perguntaId: string) => {
    if (!auditoriaId) return;
    
    const observacao = observacoes[perguntaId] || '';
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        const { error } = await supabase
          .from('respostas')
          .update({
            observacao: observacao
          })
          .eq('id', respostaExistente.id);
        
        if (error) throw error;
        
        toast({
          title: "Observação salva",
          description: "A observação foi salva com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a observação.",
        variant: "destructive"
      });
    }
  };
  
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
  
  const handleSelectSupervisor = (value: string) => {
    setSupervisor(value);
    handleSaveSupervisor();
  };
  
  const handleSelectGerente = (value: string) => {
    setGerente(value);
    handleSaveGerente();
  };
  
  const getPerguntasBySecao = (secaoId: string) => {
    return perguntas?.filter(pergunta => pergunta.secao_id === secaoId) || [];
  };

  const saveAndNavigateHome = async () => {
    if (isSaving || !auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as respostas.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
  
  const isActiveSecaoCompleta = completedSections.includes(activeSecao || '');
  
  const isLastPerguntaInSection = (perguntaId: string) => {
    if (!perguntas) return false;
    
    const perguntasDestaSecao = perguntas.filter(p => p.secao_id === activeSecao);
    const lastPergunta = perguntasDestaSecao[perguntasDestaSecao.length - 1];
    
    return lastPergunta && lastPergunta.id === perguntaId;
  };

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center text-gray-700">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Voltar</span>
        </Link>
        <div className="text-right text-gray-600">
          {currentDate}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center mb-4">
          <Store className="h-5 w-5 text-[#00bfa5] mr-2" />
          <h1 className="text-xl font-bold">{auditoria?.loja?.nome} {auditoria?.loja?.numero}</h1>
          <div className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {Math.round(progresso)}% completo
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Supervisor(a)</label>
            <div className="relative">
              {isEditingSupervisor ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select 
                      value={supervisor || "no-supervisor"} 
                      onValueChange={(value) => setSupervisor(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-supervisor">Selecione um supervisor</SelectItem>
                        {usuarios?.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.nome}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleSaveSupervisor}
                    variant="outline" 
                    className="h-10 px-3 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditingSupervisor(false);
                      setSupervisor(auditoria?.supervisor || '');
                    }}
                    variant="outline" 
                    className="h-10 px-3"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 border rounded-md bg-gray-50 flex items-center">
                    <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                    {supervisor || 'Não definido'}
                  </div>
                  <Button 
                    onClick={() => setIsEditingSupervisor(true)}
                    variant="outline" 
                    className="h-10 px-3"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 block mb-1">Gerente da Loja</label>
            <div className="relative">
              {isEditingGerente ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select 
                      value={gerente || "no-gerente"} 
                      onValueChange={(value) => setGerente(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um gerente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-gerente">Selecione um gerente</SelectItem>
                        {usuarios?.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.nome}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleSaveGerente}
                    variant="outline" 
                    className="h-10 px-3 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditingGerente(false);
                      setGerente(auditoria?.gerente || '');
                    }}
                    variant="outline" 
                    className="h-10 px-3"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 border rounded-md bg-gray-50 flex items-center">
                    <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                    {gerente || 'Não definido'}
                  </div>
                  <Button 
                    onClick={() => setIsEditingGerente(true)}
                    variant="outline" 
                    className="h-10 px-3"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {secoes?.map((secao) => {
            const isCompleted = completedSections.includes(secao.id);
            return (
              <Button
                key={secao.id}
                variant={activeSecao === secao.id ? "default" : "outline"}
                onClick={() => setActiveSecao(secao.id)}
                className={`whitespace-nowrap flex items-center gap-1 ${
                  activeSecao === secao.id 
                    ? 'bg-[#00bfa5] hover:bg-[#00a896]' 
                    : isCompleted 
                      ? 'bg-[#4ade80] text-white hover:bg-[#22c55e]' 
                      : ''
                }`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
                {secao.nome}
              </Button>
            );
          })}
        </div>
      </div>
      
      {activeSecaoObj && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">{activeSecaoObj.nome}</h2>
          <div className="text-sm text-gray-600 mb-4">
            Seção {secaoIndex + 1} de {totalSecoes}
          </div>
          
          <div className="mb-6">
            <Progress value={(secaoIndex + 1) / totalSecoes * 100} className="h-2" />
          </div>
          
          <div className="space-y-8">
            {perguntasSecaoAtiva.map((pergunta, index) => {
              const isLastPergunta = isLastPerguntaInSection(pergunta.id);
              const anexoUrl = respostasExistentes?.find(r => r.pergunta_id === pergunta.id)?.anexo_url || '';
              const observacao = respostasExistentes?.find(r => r.pergunta_id === pergunta.id)?.observacao || '';
              
              return (
                <div key={pergunta.id} className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-6">{pergunta.texto}</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      className={`h-12 ${respostas[pergunta.id] === 'Sim' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                      onClick={() => handleResposta(pergunta.id, 'Sim')}
                    >
                      Sim
                    </Button>
                    <Button
                      variant="outline"
                      className={`h-12 ${respostas[pergunta.id] === 'Não' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                      onClick={() => handleResposta(pergunta.id, 'Não')}
                    >
                      Não
                    </Button>
                    <Button
                      variant="outline"
                      className={`h-12 ${respostas[pergunta.id] === 'Regular' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                      onClick={() => handleResposta(pergunta.id, 'Regular')}
                    >
                      Regular
                    </Button>
                    <Button
                      variant="outline"
                      className={`h-12 ${respostas[pergunta.id] === 'N/A' ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''}`}
                      onClick={() => handleResposta(pergunta.id, 'N/A')}
                    >
                      N/A
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor={`observacao-${pergunta.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Observação
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id={`observacao-${pergunta.id}`}
                        type="text"
                        placeholder="Adicione uma observação se necessário"
                        className="flex-1"
                        value={observacoes[pergunta.id] || observacao}
                        onChange={(e) => handleObservacaoChange(pergunta.id, e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleSaveObservacao(pergunta.id)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {isLastPergunta && (
                    <div className="mt-4">
                      <label htmlFor={`file-${pergunta.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Anexar Foto/Arquivo
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            id={`file-${pergunta.id}`}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            className="flex-1"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(pergunta.id, file);
                              }
                            }}
                            disabled={uploading[pergunta.id]}
                          />
                          <Button 
                            variant="outline"
                            disabled={uploading[pergunta.id]} 
                            className={`min-w-[40px] ${uploading[pergunta.id] ? 'animate-pulse' : ''}`}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {anexoUrl && (
                          <div className="p-2 bg-gray-50 border rounded flex justify-between items-center">
                            <a 
                              href={anexoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Ver anexo
                            </a>
                          </div>
                        )}
                        
                        {uploading[pergunta.id] && (
                          <div className="text-sm text-gray-500">Enviando arquivo...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousSection}
              disabled={isFirstSection}
              className="flex items-center"
            >
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
              Seção Anterior
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="default"
                className="bg-[#00bfa5] hover:bg-[#00a896] px-6 py-2 h-12"
                onClick={saveAndNavigateHome}
                disabled={isSaving}
              >
                <Save className="mr-2 h-5 w-5" />
                Salvar e Voltar
              </Button>
              
              <Button
                variant="outline"
                className="border-[#00bfa5] text-[#00bfa5] px-6 py-2 h-12"
                onClick={navigateToReport}
                disabled={isSaving}
              >
                <List className="mr-2 h-5 w-5" />
                Ver Relatório
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={goToNextSection}
              disabled={isLastSection}
              className="flex items-center"
            >
              Próxima Seção
              <ArrowRightCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
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
