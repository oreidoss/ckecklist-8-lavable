
import { useState, useEffect } from 'react';
import { Secao, Pergunta } from '@/lib/types';

/**
 * Hook for managing section state and edit mode
 */
export const useSectionManagement = (secoes: Secao[] | undefined) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  
  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);
  
  // Check if current section is in editing mode
  const isEditingActive = activeSecao ? editingSections[activeSecao] === true : false;
  
  // Toggle edit mode for the active section
  const toggleEditMode = () => {
    if (!activeSecao) return;
    
    console.log(`Alternando modo de edição para seção ${activeSecao}. Atual: ${editingSections[activeSecao]}`);
    
    setEditingSections(prev => {
      const newState = {
        ...prev,
        [activeSecao]: !prev[activeSecao]
      };
      console.log("Novo estado de edição:", newState);
      return newState;
    });
  };

  /**
   * Get questions for the specified section
   */
  const getPerguntasBySecao = (secaoId: string): Pergunta[] => {
    return [];  // This will be properly implemented in the parent hook
  };

  return {
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode,
    getPerguntasBySecao
  };
};
