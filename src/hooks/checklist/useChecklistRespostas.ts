
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { useState } from 'react';

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
  const [isSaving, setIsSaving] = useState(false);

  const pontuacaoMap: Record<RespostaValor, number> = {
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
        
        if (error) throw error;
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
        
        if (error) throw error;
      }
      
      if (auditoriaId) {
        // Calculate the new total score after this update
        let pontuacaoTotal = 0;
        
        // Add up scores from existing responses (excluding the current one)
        respostasExistentes?.forEach(r => {
          if (r.pergunta_id !== perguntaId) {
            pontuacaoTotal += r.pontuacao_obtida || 0;
          }
        });
        
        // Add the score for the current response
        pontuacaoTotal += pontuacao;
        
        console.log(`Updating pontuacao_total for auditoria ${auditoriaId}: ${pontuacaoTotal}`);
        
        const { error } = await supabase
          .from('auditorias')
          .update({ 
            pontuacao_total: pontuacaoTotal,
          })
          .eq('id', auditoriaId);
          
        if (error) throw error;
      }
      
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

  return { handleResposta, pontuacaoMap, isSaving };
};
