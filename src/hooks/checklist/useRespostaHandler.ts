
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { usePontuacao } from './usePontuacao';

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
  const { pontuacaoMap } = usePontuacao();

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: any[]) => {
    if (!auditoriaId) {
      console.error("auditoriaId não fornecido");
      return;
    }

    setIsSaving(true);
    
    try {
      // Calculate pontuacao_obtida based on response
      const pontuacao_obtida = resposta ? pontuacaoMap[resposta] || 0 : 0;

      // Save response to Supabase
      const { error } = await supabase
        .from('respostas')
        .insert({
          auditoria_id: auditoriaId,
          pergunta_id: perguntaId,
          resposta,
          pontuacao_obtida,
          observacao: observacoes[perguntaId] || null,
          anexo_url: fileUrls[perguntaId] || null,
        });

      if (error) throw error;

      // Update local state
      setRespostas(prev => ({
        ...prev,
        [perguntaId]: resposta
      }));

      // Calculate progress if we have perguntas
      if (perguntas?.length) {
        const respostasCount = Object.keys(respostas).length;
        const novoProgresso = (respostasCount / perguntas.length) * 100;
        setProgresso(novoProgresso);
      }

      // Update scores
      await updatePontuacaoPorSecao();

      console.log("Resposta salva com sucesso:", { perguntaId, resposta, pontuacao_obtida });
    } catch (error: any) {
      console.error("Erro ao salvar resposta:", error);
      toast({
        title: "Erro ao salvar resposta",
        description: error.message || "Ocorreu um erro ao salvar sua resposta",
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
