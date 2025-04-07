
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook for handling individual question responses
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

  // Define pontuacaoMap values - ensure consistent scoring across all hooks
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => {
    if (!auditoriaId) return;
    
    console.log(`Handling resposta for pergunta ${perguntaId}: ${resposta}`);
    setIsSaving(true);
    
    // Update local state BEFORE any async operations for immediate UI feedback
    setRespostas(prev => {
      const updatedRespostas = {
        ...prev,
        [perguntaId]: resposta
      };
      
      // Also update progress if we have perguntas
      if (perguntas?.length) {
        const respostasCount = Object.keys(updatedRespostas).length;
        const novoProgresso = (respostasCount / perguntas.length) * 100;
        setProgresso(novoProgresso);
      }
      
      return updatedRespostas;
    });
    
    // Calculate pontuacao based on the response value
    const pontuacao = pontuacaoMap[resposta] || 0;
    console.log(`Calculated pontuacao for "${resposta}": ${pontuacao}`);
    
    const observacao = observacoes[perguntaId] || '';
    const anexo_url = fileUrls[perguntaId] || '';
    
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        console.log(`Updating existing response for pergunta ${perguntaId}:`, {
          resposta: resposta,
          pontuacao_obtida: pontuacao
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
        
        if (error) throw error;
      } else {
        console.log(`Creating new response for pergunta ${perguntaId}:`, {
          resposta: resposta,
          pontuacao_obtida: pontuacao
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
        
        if (error) throw error;
      }
      
      if (auditoriaId) {
        // Calculate the new total score after this update
        const { data: allRespostas, error: fetchError } = await supabase
          .from('respostas')
          .select('*')
          .eq('auditoria_id', auditoriaId);
        
        if (fetchError) throw fetchError;
        
        let pontuacaoTotal = 0;
        allRespostas.forEach(r => {
          if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
            pontuacaoTotal += Number(r.pontuacao_obtida);
          }
        });
        
        console.log(`Updating pontuacao_total for auditoria ${auditoriaId}: ${pontuacaoTotal}`);
        
        const { error } = await supabase
          .from('auditorias')
          .update({ 
            pontuacao_total: pontuacaoTotal,
          })
          .eq('id', auditoriaId);
          
        if (error) throw error;
      }
      
      // Update section scores in real-time - important to wait for this to complete
      await updatePontuacaoPorSecao();
      
      // Show success message
      toast({
        title: "Resposta salva",
        description: "Sua resposta foi salva com sucesso.",
      });
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
