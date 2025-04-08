
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
    if (!auditoriaId) return;
    
    console.log(`Manipulando resposta para pergunta ${perguntaId}: ${resposta}`);
    setIsSaving(true);
    
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
    const pontuacao = pontuacaoMap[resposta] || 0;
    console.log(`Pontuação calculada para "${resposta}": ${pontuacao}`);
    
    const observacao = observacoes[perguntaId] || '';
    const anexo_url = fileUrls[perguntaId] || '';
    
    const respostaExistente = respostasExistentes?.find(r => r.pergunta_id === perguntaId);
    
    try {
      if (respostaExistente) {
        console.log(`Atualizando resposta existente para pergunta ${perguntaId}:`, {
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
        console.log(`Criando nova resposta para pergunta ${perguntaId}:`, {
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
      
      // Recalcular pontuação total da auditoria após atualização
      await updateAuditoriaPontuacaoTotal(auditoriaId);
      
      // Atualizar pontuações por seção em tempo real - importante esperar que isso complete
      await updatePontuacaoPorSecao();
      
      // Mostrar mensagem de sucesso
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

  // Função auxiliar para recalcular e atualizar a pontuação total da auditoria
  const updateAuditoriaPontuacaoTotal = async (auditoriaId: string) => {
    try {
      // Buscar todas as respostas atuais para esta auditoria
      const { data: respostas, error: fetchError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
      
      if (fetchError) throw fetchError;
      
      // Recalcular pontuação total com base nas respostas atuais
      let pontuacaoTotal = 0;
      respostas.forEach(r => {
        if (r.pontuacao_obtida !== null && r.pontuacao_obtida !== undefined) {
          pontuacaoTotal += Number(r.pontuacao_obtida);
        }
      });
      
      console.log(`Atualizando pontuacao_total para auditoria ${auditoriaId}: ${pontuacaoTotal}`);
      
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
    handleResposta,
    pontuacaoMap,
    isSaving
  };
};
