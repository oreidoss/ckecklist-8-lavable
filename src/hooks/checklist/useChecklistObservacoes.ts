
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage checklist observations
 */
export const useChecklistObservacoes = (auditoriaId: string | undefined) => {
  const { toast } = useToast();
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});

  const handleObservacaoChange = (perguntaId: string, value: string) => {
    setObservacoes(prev => ({ ...prev, [perguntaId]: value }));
  };

  const handleSaveObservacao = async (perguntaId: string, respostasExistentes: any[]) => {
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

  return { 
    observacoes, 
    handleObservacaoChange, 
    handleSaveObservacao 
  };
};
