
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
    if (!auditoriaId) {
      console.error("Não é possível salvar resposta sem auditoriaId");
      return;
    }
    
    console.log(`Manipulando resposta para pergunta ${perguntaId}: ${resposta}`);
    setIsSaving(true);
    
    // Atualiza o estado local ANTES de operações assíncronas para feedback imediato na UI
    setRespostas(prev => {
      const updatedRespostas = {
        ...prev,
        [perguntaId]: resposta
      };
      
      // Atualiza progresso se tivermos perguntas
      if (perguntas?.length) {
        const respostasCount = Object.keys(updatedRespostas).length;
        const novoProgresso = (respostasCount / perguntas.length) * 100;
        setProgresso(novoProgresso);
      }
      
      return updatedRespostas;
    });
    
    try {
      // Calcula a pontuação com base no valor da resposta
      const pontuacao = pontuacaoMap[resposta] || 0;
      console.log(`Pontuação calculada para "${resposta}": ${pontuacao}`);
      
      const observacao = observacoes[perguntaId] || '';
      const anexo_url = fileUrls[perguntaId] || '';
      
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      // Log para depuração
      if (respostaExistente) {
        console.log(`Resposta existente encontrada:`, respostaExistente);
        console.log(`Alterando resposta de "${respostaExistente.resposta}" para "${resposta}"`);
        console.log(`Alterando pontuação de ${respostaExistente.pontuacao_obtida} para ${pontuacao}`);
      }
      
      if (respostaExistente) {
        // Atualizar a resposta existente no banco de dados
        console.log(`Atualizando resposta existente para pergunta ${perguntaId}:`, {
          resposta: resposta,
          pontuacao_obtida: pontuacao,
          observacao,
          anexo_url
        });
        
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
          throw error;
        } else {
          console.log("Resposta atualizada com sucesso!");
          // Notificação de sucesso
          toast({
            title: "Resposta salva",
            description: "Sua resposta foi salva com sucesso.",
          });
        }
      } else {
        // Criar uma nova resposta no banco de dados
        console.log(`Criando nova resposta para pergunta ${perguntaId}:`, {
          resposta: resposta,
          pontuacao_obtida: pontuacao,
          observacao,
          anexo_url
        });
        
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
          console.error("Erro ao criar resposta:", error);
          throw error;
        } else {
          console.log("Nova resposta criada com sucesso!");
          // Notificação de sucesso
          toast({
            title: "Resposta salva",
            description: "Sua resposta foi salva com sucesso.",
          });
        }
      }
      
      try {
        // Atualize as pontuações após cada alteração de resposta
        await updatePontuacaoPorSecao();
        console.log("Pontuações por seção atualizadas após salvar resposta");
      } catch (error) {
        console.error("Erro ao atualizar pontuações de seção após salvar resposta:", error);
      }
      
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a resposta.",
        variant: "destructive"
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
