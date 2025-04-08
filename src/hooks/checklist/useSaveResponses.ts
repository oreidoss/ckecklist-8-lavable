
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para lidar com o salvamento em lote de respostas
 */
export const useSaveResponses = (
  auditoriaId: string | undefined,
  updatePontuacaoPorSecao: () => Promise<void>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Função para salvar todas as respostas de uma vez (para uso com botão Próximo/Salvar)
  const saveAllResponses = async (): Promise<void> => {
    if (!auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      console.log("Salvando todas as respostas...");
      
      // Atualizar pontuações da seção
      await updatePontuacaoPorSecao();
      
      // Recalcular pontuação total da auditoria
      await updateAuditoriaPontuacaoTotal(auditoriaId);
      
      toast({
        title: "Seção salva",
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
      throw error; // Propagar erro para tratamento na UI
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função auxiliar para recalcular e atualizar a pontuação total da auditoria
  const updateAuditoriaPontuacaoTotal = async (auditoriaId: string): Promise<void> => {
    try {
      // Buscar todas as respostas atuais para esta auditoria
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('pontuacao_obtida')
        .eq('auditoria_id', auditoriaId);
      
      if (fetchError) throw fetchError;
      
      // Recalcular pontuação total 
      let pontuacaoTotal = 0;
      respostas.forEach(r => {
        if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
          pontuacaoTotal += Number(r.pontuacao_obtida);
        }
      });
      
      console.log(`Recalculando pontuacao_total para auditoria ${auditoriaId}: ${pontuacaoTotal}`);
      
      // Atualizar auditoria com nova pontuação total
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
        })
        .eq('id', auditoriaId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar pontuação total da auditoria:", error);
    }
  };

  return {
    saveAllResponses,
    isSaving,
    setIsSaving
  };
};
