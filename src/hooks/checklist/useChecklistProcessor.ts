
import { useCallback } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta, Secao, Resposta } from '@/lib/types';

/**
 * Hook to process existing checklist responses
 * 
 * @param respostasExistentes Existing responses from database
 * @param perguntas Questions data array
 * @param secoes Sections data array
 * @param respostas Current response values state
 * @param setRespostas Function to update responses state
 * @param setProgresso Function to update progress state
 * @param setCompletedSections Function to update completed sections state
 * @param updateIncompleteSections Function to update incomplete sections
 * @returns Functions for processing existing responses
 */
export const useChecklistProcessor = (
  respostasExistentes: Resposta[] | undefined,
  perguntas: Pergunta[] | undefined,
  secoes: Secao[] | undefined,
  respostas: Record<string, RespostaValor>,
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  setCompletedSections: React.Dispatch<React.SetStateAction<string[]>>,
  updateIncompleteSections: () => void
) => {
  
  /**
   * Process existing responses to update the UI state
   */
  const processExistingResponses = useCallback(() => {
    if (!respostasExistentes?.length || !perguntas?.length || !secoes?.length) return;
    
    // Skip this if we already have respostas loaded to prevent loss of unsaved changes
    if (Object.keys(respostas).length > 0) return;
    
    console.log("Processing existing responses:", respostasExistentes.length);
    
    // Map responses by pergunta_id for easier access
    const respostasMap: Record<string, RespostaValor> = {};
    respostasExistentes.forEach(resposta => {
      if (resposta.pergunta_id && resposta.resposta) {
        respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
        console.log(`Mapped response for question ${resposta.pergunta_id}: ${resposta.resposta}`);
      }
    });
    
    // Set responses all at once to prevent multiple re-renders
    setRespostas(respostasMap);
    
    // Calculate progress percentage
    const answeredCount = Object.keys(respostasMap).length;
    const totalQuestions = perguntas.length;
    const progresso = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    setProgresso(progresso);
    
    // Calculate section completion status
    calculateSectionCompletionStatus(respostasMap);
    
  }, [respostasExistentes, perguntas, secoes, respostas, setRespostas, setProgresso]);

  /**
   * Determine which sections are complete based on answers
   */
  const calculateSectionCompletionStatus = useCallback((respostasMap: Record<string, RespostaValor>) => {
    if (!secoes || !perguntas) return;
    
    const completedSections: string[] = [];
    
    secoes.forEach(secao => {
      const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
      // A section is complete if all questions have responses
      const todasRespondidas = perguntasSecao.length > 0 && perguntasSecao.every(pergunta => 
        respostasMap[pergunta.id] !== undefined
      );
      
      // If all questions in this section have answers, mark it as completed
      if (todasRespondidas) {
        completedSections.push(secao.id);
      }
    });
    
    setCompletedSections(completedSections);
    updateIncompleteSections();
  }, [perguntas, secoes, setCompletedSections, updateIncompleteSections]);

  return { 
    processExistingResponses,
    calculateSectionCompletionStatus
  };
};
