
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for enhanced navigation between checklist sections with automatic edit mode handling
 */
export const useChecklistEnhancedNavigation = (
  activeSecao: string | null,
  secoes: any[] | undefined, 
  saveAllResponses: () => Promise<void>,
  setActiveSecao: (secaoId: string) => void,
  editingSections: Record<string, boolean>,
  setEditingSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  completedSections: string[]
) => {
  const { toast } = useToast();
  
  // Enhanced method to save and navigate to next section
  const enhancedSaveAndNavigateToNextSection = async (): Promise<boolean> => {
    try {
      // Save responses from current section
      console.log("Salvando respostas e navegando para próxima seção");
      
      // Save all responses
      await saveAllResponses();
      console.log("Respostas salvas com sucesso");
      
      if (activeSecao) {
        // Disable edit mode for current section after saving
        setEditingSections(prev => ({
          ...prev,
          [activeSecao]: false
        }));
        
        // Navigate to next section
        if (secoes) {
          const currentIndex = secoes.findIndex(s => s.id === activeSecao);
          if (currentIndex < secoes.length - 1) {
            const nextSecaoId = secoes[currentIndex + 1].id;
            console.log(`Navegando para a próxima seção: ${nextSecaoId}`);
            
            // Enable edit mode for next section if not completed
            const shouldEnableEditing = !completedSections.includes(nextSecaoId);
            setEditingSections(prev => ({
              ...prev,
              [nextSecaoId]: shouldEnableEditing
            }));
            
            // Update active section
            setActiveSecao(nextSecaoId);
            window.scrollTo(0, 0);
            
            toast({
              title: "Navegação bem-sucedida",
              description: "Respostas salvas e navegando para próxima seção.",
            });
            
            return true;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar e navegar:", error);
      toast({
        title: "Erro ao navegar",
        description: "Ocorreu um erro ao salvar as respostas antes de navegar. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Enhanced method for previous section navigation
  const enhancedNavigateToPreviousSection = (): void => {
    if (!activeSecao || !secoes) return;
    
    console.log("Navegando para seção anterior");
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    
    if (currentIndex > 0) {
      const prevSecaoId = secoes[currentIndex - 1].id;
      console.log(`Navegando para seção anterior: ${prevSecaoId}`);
      setActiveSecao(prevSecaoId);
      window.scrollTo(0, 0);
    }
  };
  
  return {
    enhancedSaveAndNavigateToNextSection,
    enhancedNavigateToPreviousSection
  };
};
