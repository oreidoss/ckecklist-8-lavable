
import { useCallback } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta, Secao, Resposta } from '@/lib/types';

/**
 * Hook to process existing checklist responses
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
  
  const processExistingResponses = useCallback(() => {
    if (!respostasExistentes?.length || !perguntas?.length || !secoes?.length) return;
    
    // Skip this if we already have respostas
    if (Object.keys(respostas).length > 0) return;
    
    const respostasMap: Record<string, RespostaValor> = {};
    respostasExistentes.forEach(resposta => {
      if (resposta.pergunta_id && resposta.resposta) {
        respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
      }
    });
    
    setRespostas(respostasMap);
    
    const progresso = (Object.keys(respostasMap).length / perguntas.length) * 100;
    setProgresso(progresso);
    
    const completedSections: string[] = [];
    
    secoes.forEach(secao => {
      const perguntasSecao = perguntas.filter(p => p.secao_id === secao.id);
      const todasRespondidas = perguntasSecao.every(pergunta => 
        respostasExistentes.some(resp => resp.pergunta_id === pergunta.id)
      );
      
      if (todasRespondidas && perguntasSecao.length > 0) {
        completedSections.push(secao.id);
      }
    });
    
    setCompletedSections(completedSections);
    updateIncompleteSections();
    
  }, [respostasExistentes, perguntas, secoes, respostas, setRespostas, setProgresso, setCompletedSections, updateIncompleteSections]);

  return { processExistingResponses };
};
