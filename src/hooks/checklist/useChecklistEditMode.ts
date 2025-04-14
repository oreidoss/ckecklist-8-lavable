
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage edit mode state for checklist sections
 */
export const useChecklistEditMode = (secoes: any[] | undefined, completedSections: string[]) => {
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Initialize edit state based on completion status
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
  
  // Toggle edit mode for current section
  const toggleEditMode = (activeSecao: string | null) => {
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
    
    // Show toast notification
    setTimeout(() => {
      toast({
        title: editingSections[activeSecao] ? "Modo visualização ativado" : "Modo edição ativado",
        description: editingSections[activeSecao] 
          ? "As respostas desta seção agora estão em modo visualização."
          : "Você agora pode editar as respostas desta seção.",
      });
    }, 100);
  };
  
  // Check if a section is in edit mode
  const isEditingActive = (activeSecao: string | null) => {
    return activeSecao ? editingSections[activeSecao] === true : false;
  };
  
  return {
    editingSections,
    setEditingSections,
    toggleEditMode,
    isEditingActive
  };
};
