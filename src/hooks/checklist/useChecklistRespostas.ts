
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
  fileUrls: Record<string, string>,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const pontuacaoMap: Record<RespostaValor, number> = {
    'Sim': 1,
    'Não': -1,
    'Regular': 0.5,
    'N/A': 0
  };

  const updatePontuacaoPorSecao = async () => {
    if (!auditoriaId || !setPontuacaoPorSecao) return;
    
    try {
      // Fetch all responses
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;

      // Fetch all perguntas to map them to secoes
      const { data: perguntasData, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;
      
      // Calculate scores by section
      const scores: Record<string, number> = {};
      
      respostasData.forEach(resposta => {
        const pergunta = perguntasData.find(p => p.id === resposta.pergunta_id);
        if (pergunta && pergunta.secao_id) {
          const secaoId = pergunta.secao_id;
          scores[secaoId] = (scores[secaoId] || 0) + (resposta.pontuacao_obtida || 0);
        }
      });
      
      console.log("Updated section scores:", scores);
      setPontuacaoPorSecao(scores);
    } catch (error) {
      console.error("Error updating section scores:", error);
    }
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
      
      // Update section scores in real-time
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
  
  // Function to save all responses at once (for use with Next button)
  const saveAllResponses = async () => {
    if (!auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      // Since responses are already being saved individually when selected,
      // we just need to ensure the section scores are updated
      await updatePontuacaoPorSecao();
      
      toast({
        title: "Seção salva",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas.",
        variant: "destructive"
      });
      throw error; // Propagate error for handling in the UI
    } finally {
      setIsSaving(false);
    }
  };

  return { handleResposta, pontuacaoMap, isSaving, saveAllResponses, updatePontuacaoPorSecao };
};
