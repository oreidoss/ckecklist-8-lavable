
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

export const useRespostaHandler = (
  auditoriaId: string | undefined,
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  observacoes: Record<string, string>,
  fileUrls: Record<string, string>,
  updatePontuacaoPorSecao: () => Promise<void>
) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Mapa de pontuação para cada tipo de resposta
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => {
    console.log("[DEBUG] Iniciando handleResposta com dados:", { 
      perguntaId, 
      resposta, 
      auditoriaId,
      respostasExistentesCount: respostasExistentes?.length,
      temPerguntas: !!perguntas?.length
    });

    // Validações iniciais
    if (!auditoriaId) {
      console.error("[ERRO] auditoriaId não fornecido:", auditoriaId);
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da auditoria não encontrado. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!perguntaId) {
      console.error("[ERRO] perguntaId inválido:", perguntaId);
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da pergunta inválido. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    // Verificar conexão com Supabase
    try {
      console.log("[INFO] Verificando conexão com Supabase...");
      const { data: testConnection, error: connectionError } = await supabase.from('respostas').select('count');
      
      if (connectionError) {
        console.error("[ERRO] Problema de conexão com Supabase:", connectionError);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão.",
          variant: "destructive"
        });
        return;
      }
      console.log("[INFO] Conexão com Supabase OK");
    } catch (connectionError) {
      console.error("[ERRO] Falha ao verificar conexão:", connectionError);
      toast({
        title: "Erro de conexão",
        description: "Erro ao verificar conexão com o servidor.",
        variant: "destructive"
      });
      return;
    }
    
    // Proteger contra múltiplos salvamentos simultâneos
    if (isSaving) {
      console.log("[AVISO] Salvamento já em andamento, ignorando requisição");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Atualiza estado local para feedback imediato
      setRespostas(prev => {
        console.log("[INFO] Atualizando estado local das respostas");
        const updatedRespostas = {
          ...prev,
          [perguntaId]: resposta
        };
        
        if (perguntas?.length) {
          const respostasCount = Object.keys(updatedRespostas).length;
          const novoProgresso = (respostasCount / perguntas.length) * 100;
          console.log("[INFO] Progresso atualizado:", novoProgresso.toFixed(2) + "%");
          setProgresso(novoProgresso);
        }
        
        return updatedRespostas;
      });
      
      // Calcular pontuação
      const pontuacao = resposta !== null ? (pontuacaoMap[resposta] ?? 0) : 0;
      console.log(`[INFO] Pontuação calculada para "${resposta}": ${pontuacao}`);
      
      const observacao = observacoes[perguntaId] || '';
      const anexo_url = fileUrls[perguntaId] || '';
      
      // Verificar resposta existente
      console.log("[INFO] Buscando resposta existente para perguntaId:", perguntaId);
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      console.log("[DEBUG] Dados para salvamento:", {
        respostaExistente: respostaExistente ? 'Sim' : 'Não',
        auditoriaId,
        perguntaId,
        resposta,
        pontuacao,
        observacao,
        anexo_url
      });

      let result;
      if (respostaExistente) {
        console.log("[INFO] Atualizando resposta existente:", respostaExistente.id);
        result = await supabase
          .from('respostas')
          .update({
            resposta,
            pontuacao_obtida: pontuacao,
            observacao,
            anexo_url
          })
          .eq('id', respostaExistente.id);
      } else {
        console.log("[INFO] Criando nova resposta");
        result = await supabase
          .from('respostas')
          .insert({
            auditoria_id: auditoriaId,
            pergunta_id: perguntaId,
            resposta,
            pontuacao_obtida: pontuacao,
            observacao,
            anexo_url
          });
      }
      
      if (result.error) {
        console.error("[ERRO] Erro Supabase detalhado:", {
          codigo: result.error.code,
          mensagem: result.error.message,
          detalhes: result.error.details,
          hint: result.error.hint
        });
        throw result.error;
      }

      console.log("[SUCESSO] Resposta salva com sucesso");
      
      // Atualiza pontuações
      await updatePontuacaoPorSecao();
      
      toast({
        title: "Resposta salva",
        description: `Resposta "${resposta}" registrada com pontuação ${pontuacao}.`,
      });
      
    } catch (error: any) {
      console.error("[ERRO] Falha ao salvar resposta:", error);
      console.error("[ERRO] Stack trace:", error.stack);
      
      if (error.code || error.details || error.hint) {
        console.error("[ERRO] Detalhes Supabase:", {
          codigo: error.code || 'N/A',
          detalhes: error.details || 'N/A',
          hint: error.hint || 'N/A'
        });
      }
      
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a resposta. Tente novamente.",
        variant: "destructive"
      });
      
      // Reverter estado local em caso de erro
      setRespostas(prev => {
        const updatedRespostas = { ...prev };
        delete updatedRespostas[perguntaId];
        return updatedRespostas;
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleResposta,
    pontuacaoMap,
    isSaving
  };
};
