
import { useToastNotification } from './useToastNotification';
import { Secao } from '@/lib/types';

/**
 * Hook for enhanced navigation between checklist sections
 */
export const useEnhancedNavigation = (
  activeSecao: string | null,
  setActiveSecao: (secaoId: string) => void,
  secoes: Secao[] | undefined,
  editingSections: Record<string, boolean>,
  setEditingSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  completedSections: string[],
  saveAllResponses: () => Promise<void>
) => {
  const { showNavigationSuccessToast, showNavigationErrorToast } = useToastNotification();

  /**
   * Enhanced method to save and navigate to next section
   */
  const enhancedSaveAndNavigateToNextSection = async (): Promise<boolean> => {
    try {
      // Save all responses for current section
      console.log("Salvando respostas e navegando para próxima seção");
      await saveAllResponses();
      console.log("Respostas salvas com sucesso");
      
      if (activeSecao) {
        // Disable editing mode for current section after saving
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
            
            // Enable editing mode for next section if not complete
            const shouldEnableEditing = !completedSections.includes(nextSecaoId);
            setEditingSections(prev => ({
              ...prev,
              [nextSecaoId]: shouldEnableEditing
            }));
            
            // Update active section and scroll to top
            setActiveSecao(nextSecaoId);
            window.scrollTo(0, 0);
            
            showNavigationSuccessToast();
            return true;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar e navegar:", error);
      showNavigationErrorToast();
      return false;
    }
  };

  return {
    enhancedSaveAndNavigateToNextSection
  };
};
