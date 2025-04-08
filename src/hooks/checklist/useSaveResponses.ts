
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
    if (!auditoriaId) {
      console.error("Não é possível salvar respostas sem auditoriaId");
      return Promise.reject("Auditoria ID não fornecido");
    }
    
    console.log("Iniciando saveAllResponses para auditoria:", auditoriaId);
    setIsSaving(true);
    
    try {
      console.log("Salvando todas as respostas...");
      
      // Primeiro atualizar pontuações da seção 
      await updatePontuacaoPorSecao();
      console.log("Pontuações por seção atualizadas com sucesso");
      
      // Depois recalcular pontuação total da auditoria baseado nas seções atualizadas
      await updateAuditoriaPontuacaoTotal(auditoriaId);
      console.log("Pontuação total da auditoria atualizada com sucesso");
      
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
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função auxiliar para recalcular e atualizar a pontuação total da auditoria
  const updateAuditoriaPontuacaoTotal = async (auditoriaId: string): Promise<void> => {
    try {
      console.log("Atualizando pontuação total para auditoria:", auditoriaId);
      
      // Buscar todas as respostas atuais para esta auditoria
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('pergunta_id, pontuacao_obtida')
        .eq('auditoria_id', auditoriaId);
      
      if (fetchError) {
        console.error("Erro ao buscar respostas:", fetchError);
        throw fetchError;
      }
      
      console.log(`Encontradas ${respostas?.length || 0} respostas para cálculo de pontuação total`);
      
      // Mapeamento único por pergunta para garantir que apenas a última resposta seja contabilizada
      const uniqueRespostas = new Map();
      
      // Para cada resposta, armazenar apenas a mais recente por pergunta
      respostas.forEach(r => {
        uniqueRespostas.set(r.pergunta_id, r);
      });
      
      console.log(`Usando ${uniqueRespostas.size} respostas únicas para cálculo final`);
      
      // Recalcular pontuação total
      let pontuacaoTotal = 0;
      
      // Somar todas as pontuações únicas
      uniqueRespostas.forEach(r => {
        if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
          pontuacaoTotal += Number(r.pontuacao_obtida);
          console.log(`Adicionando pontuação ${r.pontuacao_obtida} para pergunta ${r.pergunta_id}`);
        }
      });
      
      console.log(`Pontuação total calculada: ${pontuacaoTotal} (de ${uniqueRespostas.size} respostas únicas)`);
      
      // Atualizar auditoria com nova pontuação total
      const { error } = await supabase
        .from('auditorias')
        .update({ 
          pontuacao_total: pontuacaoTotal,
        })
        .eq('id', auditoriaId);
        
      if (error) {
        console.error("Erro ao atualizar pontuação total:", error);
        throw error;
      } else {
        console.log("Pontuação total atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar pontuação total da auditoria:", error);
      throw error;
    }
  };

  return {
    saveAllResponses,
    isSaving,
    setIsSaving
  };
};
