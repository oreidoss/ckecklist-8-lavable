
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSaveResponses = (
  auditoriaId: string | undefined,
  updatePontuacaoPorSecao: () => Promise<void>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveAllResponses = async (): Promise<void> => {
    if (!auditoriaId) {
      console.error("Não é possível salvar respostas sem auditoriaId");
      return Promise.reject("Auditoria ID não fornecido");
    }
    
    console.log("Iniciando saveAllResponses para auditoria:", auditoriaId);
    setIsSaving(true);
    
    try {
      // Atualizar pontuações por seção e total
      await updatePontuacaoPorSecao();
      console.log("Pontuações por seção atualizadas com sucesso");
      
      // Buscar respostas atuais
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;

      // Calculate total score from responses
      let pontuacaoTotal = 0;
      const uniqueRespostas = new Map();
      
      respostas?.forEach(r => {
        if (!uniqueRespostas.has(r.pergunta_id)) {
          if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
            pontuacaoTotal += Number(r.pontuacao_obtida);
          }
          uniqueRespostas.set(r.pergunta_id, r);
        }
      });
      
      // Update auditoria with new total score
      const { error } = await supabase
        .from('auditorias')
        .update({ pontuacao_total: pontuacaoTotal })
        .eq('id', auditoriaId);
        
      if (error) throw error;
      
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar respostas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas.",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveAllResponses,
    isSaving,
    setIsSaving
  };
};
