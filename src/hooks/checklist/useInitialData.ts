import { useState, useEffect } from 'react';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook to process initial data for the checklist
 */
export const useInitialData = (
  respostasExistentes: any[] | undefined,
  perguntas: Pergunta[] | undefined,
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  setObservacoes: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setFileUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  updateCompletedSections: () => void,
  updateIncompleteSections: () => void
) => {
  const [initializingData, setInitializingData] = useState(true);

  // Process existing responses on initial load
  useEffect(() => {
    if (respostasExistentes?.length && perguntas?.length) {
      console.log("Processando respostas existentes");
      
      // Create maps for responses, observations, and file URLs
      const respostasMap: Record<string, RespostaValor> = {};
      const observacoesMap: Record<string, string> = {};
      const fileUrlsMap: Record<string, string> = {};
      
      // Use a Map to keep track of the most recent response for each question
      const latestResponses = new Map();
      
      // Sort responses by created_at, newest first
      const sortedRespostas = [...respostasExistentes].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Process responses, keeping only the most recent one for each pergunta_id
      sortedRespostas.forEach(resposta => {
        if (resposta.pergunta_id && !latestResponses.has(resposta.pergunta_id)) {
          latestResponses.set(resposta.pergunta_id, resposta);
          
          // Add to our response maps
          if (resposta.resposta) {
            respostasMap[resposta.pergunta_id] = resposta.resposta as RespostaValor;
          }
          
          if (resposta.observacao) {
            observacoesMap[resposta.pergunta_id] = resposta.observacao;
          }
          
          if (resposta.anexo_url) {
            fileUrlsMap[resposta.pergunta_id] = resposta.anexo_url;
          }
        }
      });
      
      console.log("Mapa de respostas processado:", respostasMap);
      
      // Update state
      setRespostas(respostasMap);
      setObservacoes(observacoesMap);
      setFileUrls(fileUrlsMap);
      
      // Calculate progress
      const progresso = perguntas.length > 0 ? 
        (Object.keys(respostasMap).length / perguntas.length) * 100 : 0;
      setProgresso(progresso);
      
      // Update section states
      updateCompletedSections();
      updateIncompleteSections();
      
      setInitializingData(false);
    }
  }, [
    respostasExistentes, 
    perguntas, 
    setRespostas, 
    setObservacoes, 
    setFileUrls, 
    setProgresso, 
    updateCompletedSections, 
    updateIncompleteSections
  ]);

  return { initializingData };
};
