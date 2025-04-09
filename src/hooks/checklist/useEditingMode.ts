
import { useState, useEffect } from 'react';
import { Secao } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing the editing mode state of sections
 */
export const useEditingMode = (
  secoes: Secao[] | undefined,
  activeSecao: string | null,
  completedSections: string[]
) => {
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Initialize editing state based on completed sections
  useEffect(() => {
    if (secoes && completedSections) {
      const initialEditState: Record<string, boolean> = {};
      secoes.forEach(secao => {
        // Sections that are not completed start in edit mode
        initialEditState[secao.id] = !completedSections.includes(secao.id);
      });
      setEditingSections(initialEditState);
    }
  }, [secoes, completedSections]);
  
  // Check if active section is in edit mode
  const isEditingActive = activeSecao ? editingSections[activeSecao] === true : false;
  
  // Toggle edit mode for the active section
  const toggleEditMode = () => {
    if (!activeSecao) return;
    
    setEditingSections(prev => {
      const newState = {
        ...prev,
        [activeSecao]: !prev[activeSecao]
      };
      return newState;
    });
    
    // Show toast about mode change
    setTimeout(() => {
      toast({
        title: editingSections[activeSecao] ? "Modo visualização ativado" : "Modo edição ativado",
        description: editingSections[activeSecao] 
          ? "As respostas desta seção agora estão em modo visualização."
          : "Você agora pode editar as respostas desta seção.",
      });
    }, 100);
  };

  return {
    editingSections,
    setEditingSections,
    isEditingActive,
    toggleEditMode
  };
};
