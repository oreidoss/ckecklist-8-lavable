
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
      console.error("Não é possível salvar resposta sem auditoriaId", { perguntaId, resposta });
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da auditoria não encontrado",
        variant: "destructive"
      });
      return;
    }

    console.log("Iniciando salvamento de resposta:", {
      auditoriaId,
      perguntaId,
      resposta,
      observacao: observacoes[perguntaId],
      anexo_url: fileUrls[perguntaId]
    });
    
    setIsSaving(true);
    
    try {
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
      
      // Calcula a pontuação com base no valor da resposta
      let pontuacao = 0;
      if (resposta !== null) {
        pontuacao = pontuacaoMap[resposta] !== undefined ? pontuacaoMap[resposta] : 0;
      }
      
      console.log(`Pontuação calculada para "${resposta}": ${pontuacao}`);
      
      const observacao = observacoes[perguntaId] || '';
      const anexo_url = fileUrls[perguntaId] || '';
      
      const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
      
      // Log para depuração
      console.log("Estado atual:", {
        respostaExistente,
        auditoriaId,
        perguntaId,
        resposta,
        pontuacao,
        observacao,
        anexo_url
      });

      let result;
      if (respostaExistente) {
        console.log("Atualizando resposta existente:", respostaExistente.id);
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
        console.log("Criando nova resposta");
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
        console.error("Erro ao salvar no Supabase:", result.error);
        throw result.error;
      }

      console.log("Resposta salva com sucesso:", result.data);
      
      // Atualiza pontuações após salvar resposta
      await updatePontuacaoPorSecao();
      
      toast({
        title: "Resposta salva",
        description: `Resposta "${resposta}" registrada com pontuação ${pontuacao}.`,
      });
      
    } catch (error: any) {
      console.error("Erro detalhado ao salvar resposta:", error);
      console.error("Stack trace:", error.stack);
      
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a resposta.",
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
