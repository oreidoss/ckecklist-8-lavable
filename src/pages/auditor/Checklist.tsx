
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Store, List, ChevronLeft, Save, Home } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

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
  
  useEffect(() => {
    // Set current date in PT-BR format (DD/MM/YYYY)
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('pt-BR'));
  }, []);
  
  // Fetch auditoria data
  const { data: auditoria, isLoading: loadingAuditoria } = useQuery({
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
    }
  });
  
  // Fetch secoes
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
  
  // Fetch perguntas
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
  
  // Fetch respostas existentes
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
    // Quando as respostas existentes carregarem, preencher o estado
    if (respostasExistentes?.length) {
      const respostasMap: Record<string, RespostaValor> = {};
      respostasExistentes.forEach(resposta => {
        if (resposta.pergunta_id && resposta.resposta) {
          respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
        }
      });
      
      setRespostas(respostasMap);
      
      // Atualizar progresso
      if (perguntas?.length) {
        const progresso = (respostasExistentes.length / perguntas.length) * 100;
        setProgresso(progresso);
      }
    }
  }, [respostasExistentes, perguntas]);
  
  const handleResposta = async (perguntaId: string, resposta: RespostaValor) => {
    if (!auditoriaId) return;
    
    // Atualizar estado local primeiro para UI responsiva
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: resposta
    }));
    
    const pontuacao = pontuacaoMap[resposta];
    
    // Verificar se já existe uma resposta para essa pergunta
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    if (respostaExistente) {
      // Atualizar resposta existente
      const { error } = await supabase
        .from('respostas')
        .update({
          resposta: resposta,
          pontuacao_obtida: pontuacao
        })
        .eq('id', respostaExistente.id);
      
      if (error) {
        toast({
          title: "Erro ao atualizar resposta",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      // Inserir nova resposta
      const { error } = await supabase
        .from('respostas')
        .insert({
          auditoria_id: auditoriaId,
          pergunta_id: perguntaId,
          resposta: resposta,
          pontuacao_obtida: pontuacao
        });
      
      if (error) {
        toast({
          title: "Erro ao salvar resposta",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    
    // Recalcular progresso
    if (perguntas?.length) {
      const novasRespostas = Object.keys(respostas).length + 
        (respostas[perguntaId] ? 0 : 1);
      const progresso = (novasRespostas / perguntas.length) * 100;
      setProgresso(progresso);
    }
    
    // Calcular nova pontuação total
    if (auditoria) {
      let pontuacaoTotal = 0;
      
      // Baseado nas respostas existentes
      respostasExistentes?.forEach(r => {
        if (r.pergunta_id !== perguntaId) {
          pontuacaoTotal += r.pontuacao_obtida || 0;
        }
      });
      
      // Adicionar a pontuação da nova resposta
      pontuacaoTotal += pontuacao;
      
      // Atualizar a auditoria com a nova pontuação
      await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
    }
  };
  
  const getPerguntasBySecao = (secaoId: string) => {
    return perguntas?.filter(pergunta => pergunta.secao_id === secaoId) || [];
  };

  const saveAndNavigateHome = async () => {
    if (isSaving || !auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      // Calcula a pontuação total
      let pontuacaoTotal = 0;
      respostasExistentes?.forEach(r => {
        pontuacaoTotal += r.pontuacao_obtida || 0;
      });
      
      // Atualiza a auditoria com a pontuação calculada
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
          // Opcionalmente, definir status como 'concluido' se todas as perguntas respondidas
          status: progresso === 100 ? 'concluido' : 'em_andamento'
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas foram salvas com sucesso!",
      });
      
      // Navegar para a página inicial
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
  
  if (loadingAuditoria || loadingSecoes || loadingPerguntas || loadingRespostas) {
    return <div className="flex justify-center items-center h-96">Carregando...</div>;
  }
  
  const activeSecaoObj = secoes?.find(s => s.id === activeSecao);
  const perguntasSecaoAtiva = getPerguntasBySecao(activeSecao || '');
  const secaoIndex = secoes?.findIndex(s => s.id === activeSecao) || 0;
  const totalSecoes = secoes?.length || 0;
  
  return (
    <div className="pb-12 max-w-4xl mx-auto">
      {/* Cabeçalho */}
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
        
        {/* Informações da auditoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Supervisor(a)</label>
            <input 
              type="text" 
              value={auditoria?.usuario?.nome || ''} 
              readOnly 
              className="w-full p-3 border rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Gerente da Loja</label>
            <input 
              type="text" 
              value={auditoria?.gerente || ''} 
              readOnly 
              className="w-full p-3 border rounded-md bg-gray-50"
            />
          </div>
        </div>
        
        {/* Abas de seções */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {secoes?.map((secao) => (
            <Button
              key={secao.id}
              variant={activeSecao === secao.id ? "default" : "outline"}
              onClick={() => setActiveSecao(secao.id)}
              className={`whitespace-nowrap ${activeSecao === secao.id ? 'bg-[#00bfa5] hover:bg-[#00a896]' : ''}`}
            >
              {secao.nome}
            </Button>
          ))}
        </div>
      </div>
      
      {activeSecaoObj && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">{activeSecaoObj.nome}</h2>
          <div className="text-sm text-gray-600 mb-4">
            Seção {secaoIndex + 1} de {totalSecoes}
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-[#00bfa5] rounded-full"
              style={{ width: `${(secaoIndex + 1) / totalSecoes * 100}%` }}
            ></div>
          </div>
          
          <div className="space-y-8">
            {perguntasSecaoAtiva.map((pergunta, index) => (
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
              </div>
            ))}
          </div>
          
          {/* Botão para voltar à página principal salvando as respostas */}
          <div className="mt-10 flex justify-center">
            <Button
              variant="default"
              className="bg-[#00bfa5] hover:bg-[#00a896] px-6 py-2 h-12"
              onClick={saveAndNavigateHome}
              disabled={isSaving}
            >
              <Save className="mr-2 h-5 w-5" />
              Salvar e Voltar à Página Principal
            </Button>
          </div>
        </div>
      )}
      
      {/* Return to stores button */}
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
