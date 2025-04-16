
import { useState, useEffect } from 'react';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

/**
 * Hook for managing active section state and editing mode
 */
export const useActiveSection = (
  secoes: Secao[] | undefined,
  completedSections: string[],
) => {
  const [activeSecao, setActiveSecao] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});

  // Initialize editing sections state based on completed sections
  useEffect(() => {
    if (secoes && completedSections) {
      console.log("Inicializando estado de edição para seções");
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        // Seções incompletas começam em modo de edição
        initialEditState[secao.id] = !completedSections.includes(secao.id);
      });
      console.log("Estado inicial de edição:", initialEditState);
      setEditingSections(initialEditState);
    }
  }, [secoes, completedSections]);

  // Set initial active section
  useEffect(() => {
    if (secoes?.length && activeSecao === null) {
      setActiveSecao(secoes[0].id);
    }
  }, [secoes, activeSecao]);

  // Verify if current section is in editing mode
  const isEditingActive = activeSecao ? editingSections[activeSecao] === true : false;

  // Toggle editing mode for current section
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

  return {
    activeSecao,
    setActiveSecao,
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode
  };
};
