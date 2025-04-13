
import { useState, useEffect } from 'react';
import { Secao } from '@/lib/types';

/**
 * Hook for managing the active section state in the checklist
 */
export const useActiveSectionState = (secoes: Secao[] | undefined) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  
  // Set initial active section when secoes are loaded
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);

  // Helper function to get the current section index
  const getActiveSecaoIndex = () => {
    if (!activeSecao || !secoes) return -1;
    return secoes.findIndex(s => s.id === activeSecao);
  };

  // Check if current section is first
  const isFirstSection = () => {
    return getActiveSecaoIndex() === 0;
  };

  // Check if current section is last
  const isLastSection = () => {
    if (!secoes) return true;
    return getActiveSecaoIndex() === secoes.length - 1;
  };

  return {
    activeSecao,
    setActiveSecao,
    isFirstSection,
    isLastSection,
    getActiveSecaoIndex
  };
};
