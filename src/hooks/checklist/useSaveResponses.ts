
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Resposta } from '@/lib/types';

/**
 * Hook para lidar com o salvamento em lote de respostas
 */
export const useSaveResponses = (
  auditoriaId: string | undefined,
  updatePontuacaoPorSecao: () => Promise<void>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Mapeamento de valores de resposta para pontuações numéricas
  const pontuacaoMap: Record<string, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  // Função para salvar todas as respostas de uma vez (para uso com botão Próximo/Salvar)
  const saveAllResponses = async (): Promise<void> => {
    if (!auditoriaId) {
      console.error("Não é possível salvar respostas sem auditoriaId");
      return Promise.reject("Auditoria ID não fornecido");
    }
    
    console.log("Iniciando saveAllResponses para auditoria:", auditoriaId);
    setIsSaving(true);
    
    try {
      console.log("Atualizando pontuações por seção e total...");
      
      // Primeiro atualizar pontuações da seção 
      await updatePontuacaoPorSecao();
      console.log("Pontuações por seção atualizadas com sucesso");
      
      // Buscar todas as respostas para esta auditoria
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (fetchError) {
        console.error("Erro ao buscar respostas:", fetchError);
        throw fetchError;
      }
      
      // Confirmar que as respostas foram salvas
      toast({
        title: "Respostas salvas",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
      
      return Promise.resolve();
    } catch (error) {
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
