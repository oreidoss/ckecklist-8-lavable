
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
      
      // Vamos buscar todas as respostas atuais após criar ou atualizar
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId)
        .order('created_at', { ascending: false }); // Ordenar pela data de criação para garantir que temos as mais recentes
        
      if (fetchError) {
        console.error("Erro ao buscar respostas:", fetchError);
        throw fetchError;
      }
      
      console.log(`Encontradas ${respostas?.length || 0} respostas para recálculo de pontuação total`);
      
      // Calcular pontuação total manualmente
      let pontuacaoTotal = 0;
      
      // Vamos criar um mapa para garantir que contamos apenas a última resposta de cada pergunta
      const uniqueRespostas = new Map<string, Resposta>();
      
      // Usar created_at para determinar a resposta mais recente
      // Ordenar as respostas para garantir que pegamos as mais recentes primeiro
      const respostasOrdenadas = [...(respostas as Resposta[])].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Pegar apenas a resposta mais recente para cada pergunta
      respostasOrdenadas.forEach(r => {
        if (!uniqueRespostas.has(r.pergunta_id)) {
          uniqueRespostas.set(r.pergunta_id, r);
        }
      });
      
      console.log(`Usando ${uniqueRespostas.size} respostas únicas para cálculo final`);
      
      // Agora podemos somar as pontuações usando apenas as respostas únicas
      uniqueRespostas.forEach(r => {
        if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
          const pontuacao = Number(r.pontuacao_obtida);
          pontuacaoTotal += pontuacao;
          console.log(`Adicionando pontuação ${pontuacao} para pergunta ${r.pergunta_id}, novo total: ${pontuacaoTotal}`);
        } else if (r.resposta) {
          // Se não tiver pontuacao_obtida, calcular com base na resposta
          const pontuacao = pontuacaoMap[r.resposta] !== undefined ? pontuacaoMap[r.resposta] : 0;
          pontuacaoTotal += pontuacao;
          console.log(`Calculando pontuação ${pontuacao} para resposta "${r.resposta}" na pergunta ${r.pergunta_id}, novo total: ${pontuacaoTotal}`);
        }
      });
      
      console.log(`Pontuação total calculada: ${pontuacaoTotal}`);
      
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
