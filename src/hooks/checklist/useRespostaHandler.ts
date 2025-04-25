
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook para manipular respostas individuais de perguntas
 */
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
    console.log("[DEBUG] handleResposta iniciado:", { 
      perguntaId, 
      resposta, 
      auditoriaId, 
      respostasExistentesCount: respostasExistentes?.length
    });

    if (!auditoriaId) {
      console.error("[ERRO] Não é possível salvar resposta sem auditoriaId", { perguntaId, resposta });
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da auditoria não encontrado",
        variant: "destructive"
      });
      return;
    }

    if (!perguntaId) {
      console.error("[ERRO] ID da pergunta inválido:", perguntaId);
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da pergunta inválido",
        variant: "destructive"
      });
      return;
    }

    console.log("[INFO] Iniciando salvamento de resposta:", {
      auditoriaId,
      perguntaId,
      resposta,
      observacao: observacoes[perguntaId],
      anexo_url: fileUrls[perguntaId]
    });
    
    // Proteger contra múltiplos salvamentos simultâneos
    if (isSaving) {
      console.log("[AVISO] Já existe um salvamento em andamento, ignorando solicitação");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Atualiza o estado local ANTES de operações assíncronas para feedback imediato na UI
      setRespostas(prev => {
        console.log("[INFO] Atualizando estado local de respostas");
        const updatedRespostas = {
          ...prev,
          [perguntaId]: resposta
        };
        
        // Atualiza progresso se tivermos perguntas
        if (perguntas?.length) {
          const respostasCount = Object.keys(updatedRespostas).length;
          const novoProgresso = (respostasCount / perguntas.length) * 100;
          console.log("[INFO] Atualizando progresso:", novoProgresso.toFixed(2) + "%");
          setProgresso(novoProgresso);
        }
        
        return updatedRespostas;
      });
      
      // Calcular pontuação
      let pontuacao = 0;
      if (resposta !== null) {
        pontuacao = pontuacaoMap[resposta] !== undefined ? pontuacaoMap[resposta] : 0;
      }
      
      console.log(`[INFO] Pontuação calculada para "${resposta}": ${pontuacao}`);
      
      const observacao = observacoes[perguntaId] || '';
      const anexo_url = fileUrls[perguntaId] || '';
      
      // Verificar se já existe uma resposta para esta pergunta
      console.log("[INFO] Verificando se já existe resposta para pergunta:", perguntaId);
      let respostaExistente = null;
      
      if (Array.isArray(respostasExistentes)) {
        console.log("[INFO] Procurando em", respostasExistentes.length, "respostas existentes");
        respostaExistente = respostasExistentes.find(r => r.pergunta_id === perguntaId);
      } else {
        console.warn("[AVISO] respostasExistentes não é um array:", respostasExistentes);
      }
      
      // Log para depuração
      console.log("[DEBUG] Estado atual:", {
        respostaExistente: respostaExistente ? 'Existe' : 'Não existe',
        auditoriaId,
        perguntaId,
        resposta,
        pontuacao,
        observacao,
        anexo_url,
        isSaving
      });

      // Verifica conexão com Supabase
      console.log("[INFO] Verificando conexão com Supabase...");
      try {
        const { data: pingTest, error: pingError } = await supabase
          .from('respostas')
          .select('count(*)', { count: 'exact', head: true });

        if (pingError) {
          console.error("[ERRO] Problema de conexão com Supabase:", pingError);
          throw new Error("Não foi possível conectar ao banco de dados. Verifique sua conexão.");
        }
        console.log("[INFO] Conexão com Supabase bem sucedida");
      } catch (pingError) {
        console.error("[ERRO] Falha ao verificar conexão:", pingError);
        throw new Error("Erro ao verificar conexão com o banco de dados.");
      }

      let result;
      if (respostaExistente) {
        console.log("[INFO] Atualizando resposta existente:", respostaExistente.id);
        result = await supabase
          .from('respostas')
          .update({
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          })
          .eq('id', respostaExistente.id);
      } else {
        console.log("[INFO] Criando nova resposta");
        result = await supabase
          .from('respostas')
          .insert({
            auditoria_id: auditoriaId,
            pergunta_id: perguntaId,
            resposta: resposta,
            pontuacao_obtida: pontuacao,
            observacao: observacao,
            anexo_url: anexo_url
          });
      }
      
      if (result.error) {
        console.error("[ERRO] Erro ao salvar no Supabase:", result.error);
        console.error("[ERRO] Detalhes completos:", {
          código: result.error.code,
          mensagem: result.error.message,
          detalhes: result.error.details,
          hint: result.error.hint
        });
        throw result.error;
      }

      console.log("[SUCESSO] Resposta salva com sucesso:", result.data);
      
      // Atualiza pontuações após salvar resposta
      console.log("[INFO] Atualizando pontuações por seção");
      await updatePontuacaoPorSecao();
      
      toast({
        title: "Resposta salva",
        description: `Resposta "${resposta}" registrada com pontuação ${pontuacao}.`,
      });
      
    } catch (error: any) {
      console.error("[ERRO] Erro detalhado ao salvar resposta:", error);
      console.error("[ERRO] Stack trace:", error.stack);
      
      // Tentar mais detalhes se for erro do Supabase
      if (error.code || error.details || error.hint) {
        console.error("[ERRO] Detalhes do erro Supabase:", {
          código: error.code || 'N/A',
          detalhes: error.details || 'N/A', 
          hint: error.hint || 'N/A'
        });
      }
      
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a resposta.",
        variant: "destructive"
      });
      
      // Reverter mudança de estado local em caso de erro
      setRespostas(prev => {
        console.log("[INFO] Revertendo estado local devido a erro");
        const updatedRespostas = { ...prev };
        delete updatedRespostas[perguntaId]; // Remove a resposta que falhou
        return updatedRespostas;
      });
    } finally {
      console.log("[INFO] Finalizando processo de salvamento");
      setIsSaving(false);
    }
  };

  return {
    handleResposta,
    pontuacaoMap,
    isSaving
  };
};
