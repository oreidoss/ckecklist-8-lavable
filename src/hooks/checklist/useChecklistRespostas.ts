
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook para gerenciar as respostas do checklist
 */
export const useChecklistRespostas = (
  auditoriaId: string | undefined, 
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  observacoes: Record<string, string>,
  fileUrls: Record<string, string>
) => {
  const { toast } = useToast();

  const pontuacaoMap: Record<RespostaValor, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => {
    if (!auditoriaId) return;
    
    // Update local state immediately for UI feedback
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
        // Atualiza corretamente o progresso com base em todas as respostas existentes
        const novasRespostas = {
          ...respostasExistentes.reduce((acc, r) => {
            if (r.pergunta_id && r.resposta) {
              acc[r.pergunta_id] = r.resposta as RespostaValor;
            }
            return acc;
          }, {} as Record<string, RespostaValor>),
          [perguntaId]: resposta
        };
        
        const novasRespostasCount = Object.keys(novasRespostas).length;
        const novoProgresso = (novasRespostasCount / perguntas.length) * 100;
        setProgresso(novoProgresso);
      }
      
      if (auditoriaId) {
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

  return { handleResposta, pontuacaoMap };
};
