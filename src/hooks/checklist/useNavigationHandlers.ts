
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
  const toast = useToast();

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
      return await saveAndNavigateHomeBase(respostasExistentes);
    }
    return false;
  };

  /**
   * Save responses and then navigate to the next section
   */
  const saveAndNavigateToNextSection = async () => {
    console.log("Tentando salvar e navegar para próxima seção");
    try {
      await saveAllResponses();
      console.log("Respostas salvas com sucesso, navegando para próxima seção");
      goToNextSection();
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
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
