
import { Secao } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for handling navigation between checklist sections
 */
export const useNavigationHandlers = (
  activeSecao: string | null,
  setActiveSecao: (secaoId: string) => void,
  secoes: Secao[] | undefined,
  goToNextSection: () => void,
  goToPreviousSection: () => void,
  saveAllResponses: () => Promise<void>,
  saveAndNavigateHomeBase: (respostasExistentes: any[]) => Promise<boolean>
) => {
  const { toast } = useToast();

  /**
   * Handle changing the active section
   */
  const handleSetActiveSecao = (secaoId: string) => {
    console.log(`Navegando para seção: ${secaoId}`);
    setActiveSecao(secaoId);
  };

  /**
   * Save all responses and then navigate home
   */
  const saveAndNavigateHome = async (respostasExistentes: any[] | undefined) => {
    console.log("Tentando salvar e navegar para home");
    if (respostasExistentes) {
      try {
        // Primeiro salvar todas as respostas
        await saveAllResponses();
        console.log("Respostas salvas com sucesso antes de navegar para home");
        return await saveAndNavigateHomeBase(respostasExistentes);
      } catch (error) {
        console.error("Erro ao salvar antes de navegar para home:", error);
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar as respostas antes de navegar.",
          variant: "destructive"
        });
        return false;
      }
    }
    return false;
  };

  /**
   * Save responses and then navigate to the next section
   */
  const saveAndNavigateToNextSection = async () => {
    console.log("Tentando salvar e navegar para próxima seção");
    try {
      // Primeiro salvar todas as respostas
      await saveAllResponses();
      console.log("Respostas salvas com sucesso, navegando para próxima seção");
      
      // Depois navegar para próxima seção
      goToNextSection();
      
      toast({
        title: "Navegação bem-sucedida",
        description: "Respostas salvas e navegando para próxima seção.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar respostas antes de navegar:", error);
      toast({
        title: "Erro ao navegar",
        description: "Ocorreu um erro ao salvar as respostas antes de navegar. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleSetActiveSecao,
    goToNextSection,
    goToPreviousSection,
    saveAllResponses,
    saveAndNavigateHome,
    saveAndNavigateToNextSection
  };
};
