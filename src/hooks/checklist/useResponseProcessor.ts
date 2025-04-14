
import { useCallback } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta, Secao, Resposta } from '@/lib/types';

/**
 * Hook for processing responses and calculating various metrics
 */
export const useResponseProcessor = (
  respostas: Record<string, RespostaValor>,
  perguntas: Pergunta[] | undefined,
  secoes: Secao[] | undefined,
  activeSecao: string | null
) => {
  /**
   * Check if there are unanswered questions in the active section
   */
  const hasUnansweredQuestions = useCallback(() => {
    if (!activeSecao || !perguntas) return false;
    
    try {
      const perguntasSecao = perguntas.filter(p => p.secao_id === activeSecao);
      // We typically want to check all questions except the last two 
      // (which are often optional observations and attachments)
      const requiredPerguntas = perguntasSecao.slice(0, -2);
      
      return requiredPerguntas.some(pergunta => !respostas[pergunta.id]);
    } catch (error) {
      console.error("Error checking unanswered questions:", error);
      return false; // Default to false in case of error
    }
  }, [activeSecao, perguntas, respostas]);

  /**
   * Check if a question is the last one in its section
   */
  const isLastPerguntaInSection = useCallback((perguntaId: string) => {
    if (!activeSecao || !perguntas) return false;
    
    try {
      const perguntasSecao = perguntas.filter(p => p.secao_id === activeSecao);
      if (perguntasSecao.length === 0) return false;
      
      const lastPergunta = perguntasSecao[perguntasSecao.length - 1];
      return lastPergunta.id === perguntaId;
    } catch (error) {
      console.error("Error checking if last question in section:", error);
      return false; // Default to false in case of error
    }
  }, [activeSecao, perguntas]);

  /**
   * Process existing responses to initialize state
   */
  const processResponses = useCallback((
    respostasExistentes: Resposta[] | undefined,
    setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
    setProgresso: React.Dispatch<React.SetStateAction<number>>,
    updateIncompleteSections: () => void
  ) => {
    if (!respostasExistentes?.length || !perguntas?.length) {
      return;
    }
    
    try {
      console.log("Processing responses:", respostasExistentes.length);
      
      // Map responses by pergunta_id for easier access
      const respostasMap: Record<string, RespostaValor> = {};
      respostasExistentes.forEach(resposta => {
        if (resposta.pergunta_id && resposta.resposta) {
          respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
        }
      });
      
      // Set responses
      setRespostas(respostasMap);
      
      // Calculate progress percentage
      const answeredCount = Object.keys(respostasMap).length;
      const totalQuestions = perguntas.length;
      const progresso = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
      setProgresso(progresso);
      
      // Update incomplete sections
      updateIncompleteSections();
    } catch (error) {
      console.error("Error processing responses:", error);
      // Reset to safe defaults in case of error
      setRespostas({});
      setProgresso(0);
    }
  }, [perguntas]);

  return {
    hasUnansweredQuestions,
    isLastPerguntaInSection,
    processResponses
  };
};
