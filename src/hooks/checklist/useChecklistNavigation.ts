
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Secao } from '@/lib/types';

/**
 * Hook for handling navigation between checklist sections
 */
export const useChecklistNavigation = (
  secoes: Secao[] | undefined,
  activeSecao: string | null,
  setActiveSecao: (secaoId: string) => void,
  saveAllResponses: () => Promise<void>
) => {
  const { toast } = useToast();

  // Navigate to previous section
  const goToPreviousSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex > 0) {
      setActiveSecao(secoes[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao, setActiveSecao]);

  // Navigate to next section
  const goToNextSection = useCallback(() => {
    if (!secoes || !activeSecao) return;
    
    const currentIndex = secoes.findIndex(s => s.id === activeSecao);
    if (currentIndex < secoes.length - 1) {
      setActiveSecao(secoes[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  }, [secoes, activeSecao, setActiveSecao]);

  // Save and navigate to the next section
  const saveAndNavigateToNextSection = useCallback(async () => {
    if (!secoes || !activeSecao) return false;
    
    try {
      // Save responses first
      await saveAllResponses();
      
      // Then navigate to next section
      const currentIndex = secoes.findIndex(s => s.id === activeSecao);
      if (currentIndex < secoes.length - 1) {
        setActiveSecao(secoes[currentIndex + 1].id);
        window.scrollTo(0, 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving and navigating:", error);
      toast({
        title: "Erro ao navegar",
        description: "Ocorreu um erro ao salvar as respostas antes de navegar.",
        variant: "destructive"
      });
      return false;
    }
  }, [activeSecao, secoes, saveAllResponses, setActiveSecao, toast]);

  // Save and navigate home
  const saveAndNavigateHome = useCallback(async () => {
    try {
      await saveAllResponses();
      return true;
    } catch (error) {
      console.error("Error navigating home:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as respostas.",
        variant: "destructive"
      });
      return false;
    }
  }, [saveAllResponses, toast]);

  return {
    goToPreviousSection,
    goToNextSection,
    saveAndNavigateToNextSection,
    saveAndNavigateHome
  };
};
