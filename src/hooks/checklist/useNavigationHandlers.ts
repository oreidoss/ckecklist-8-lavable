
import { Secao } from '@/lib/types';

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
  /**
   * Handle changing the active section
   */
  const handleSetActiveSecao = (secaoId: string) => {
    setActiveSecao(secaoId);
  };

  /**
   * Save all responses and then navigate home
   */
  const saveAndNavigateHome = async (respostasExistentes: any[] | undefined) => {
    if (respostasExistentes) {
      return await saveAndNavigateHomeBase(respostasExistentes);
    }
    return false;
  };

  return {
    handleSetActiveSecao,
    goToNextSection,
    goToPreviousSection,
    saveAllResponses,
    saveAndNavigateHome
  };
};
