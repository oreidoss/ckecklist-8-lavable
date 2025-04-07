
import { useState, useEffect } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook for managing section-related state in the checklist
 */
export const useSectionState = (
  secoes: Secao[] | undefined,
  perguntas: Pergunta[] | undefined,
  respostas: Record<string, RespostaValor>
) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  
  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);

  /**
   * Get questions for the specified section
   */
  const getPerguntasBySecao = (secaoId: string): Pergunta[] => {
    if (!perguntas) return [];
    return perguntas.filter(p => p.secao_id === secaoId);
  };

  return {
    activeSecao,
    setActiveSecao,
    getPerguntasBySecao
  };
};
