
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook to manage section completion state
 */
export const useChecklistSections = (
  completedSections: string[],
  setCompletedSections: React.Dispatch<React.SetStateAction<string[]>>,
  respostas: Record<string, RespostaValor>
) => {
  
  const updateCompletedSections = (activeSecao: string | null, secoes: any[], perguntas: Pergunta[]) => {
    if (activeSecao && perguntas) {
      const perguntasSecaoAtiva = perguntas.filter(p => p.secao_id === activeSecao);
      const todasRespondidasSecaoAtiva = perguntasSecaoAtiva.every(p => 
        respostas[p.id] !== undefined
      );
      
      if (todasRespondidasSecaoAtiva && !completedSections.includes(activeSecao)) {
        setCompletedSections(prev => [...prev, activeSecao]);
      }
    }
  };

  return { updateCompletedSections };
};
