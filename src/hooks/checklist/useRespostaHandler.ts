
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';
import { useConnectionVerification } from './useConnectionVerification';
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
  const { isCheckingConnection, isConnected, verifyConnection } = useConnectionVerification();
  const { pontuacaoMap } = usePontuacao();

  const handleResposta = async (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => {
    console.log("[DEBUG] Iniciando handleResposta com dados:", { 
      perguntaId, 
      resposta, 
      auditoriaId,
      respostasExistentesCount: respostasExistentes?.length,
      temPerguntas: !!perguntas?.length
    });

    // Validações iniciais
    if (!auditoriaId) {
      console.error("[ERRO] auditoriaId não fornecido:", auditoriaId);
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da auditoria não encontrado. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!perguntaId) {
      console.error("[ERRO] perguntaId inválido:", perguntaId);
      toast({
        title: "Erro ao salvar resposta",
        description: "ID da pergunta inválido. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    // Verificar conexão com Supabase
    try {
      console.log("[INFO] Verificando conexão com Supabase antes de salvar resposta...");
      const isConnectionOk = await verifyConnection();
      
      if (!isConnectionOk) {
        return;
      }
    } catch (connectionError) {
      console.error("[ERRO] Falha ao verificar conexão:", connectionError);
      toast({
        title: "Erro de conexão",
        description: "Erro ao verificar conexão com o banco de dados.",
        variant: "destructive"
      });
      return;
    }
    
    // Proteger contra múltiplos salvamentos simultâneos
    if (isSaving) {
      console.log("[AVISO] Salvamento já em andamento, ignorando requisição");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Atualiza estado local para feedback imediato
      setRespostas(prev => {
        console.log("[INFO] Atualizando estado local das respostas");
        const updatedRespostas = {
          ...prev,
          [perguntaId]: resposta
        };
        
        if (perguntas?.length) {
          const respostasCount = Object.keys(updatedRespostas).length;
          const novoProgresso = (respostasCount / perguntas.length) * 100;
          console.log("[INFO] Progresso atualizado:", novoProgresso.toFixed(2) + "%");
          setProgresso(novoProgresso);
        }
        
        return updatedRespostas;
      });

      // Update pontuações
      await updatePontuacaoPorSecao();
      
    } catch (error: any) {
      console.error("[ERRO] Falha ao salvar resposta:", error);
      console.error("[ERRO] Stack trace:", error.stack);
      
      let errorMessage = "Ocorreu um erro ao salvar a resposta. Tente novamente.";
      
      if (error.message && (
          error.message.includes('network') || 
          error.message.includes('fetch') || 
          error.message.includes('timeout') ||
          error.message.includes('conexão')
        )) {
        errorMessage = "Erro de conexão ao salvar. Verifique sua internet e tente novamente.";
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Reverter estado local em caso de erro
      setRespostas(prev => {
        const updatedRespostas = { ...prev };
        delete updatedRespostas[perguntaId];
        return updatedRespostas;
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleResposta,
    pontuacaoMap,
    isSaving,
    isConnected,
    verifyConnection
  };
};
