import { useChecklistData } from './useChecklistData';
import { useActiveSection } from './useActiveSection';
import { useChecklist } from './';

/**
 * Hook para gerenciar o estado central do checklist (dados e estado básico)
 */
export const useChecklistCoreState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Get data using existing hooks
  const checklistData = useChecklistData(auditoriaId);
  
  // Use active section management
  const sectionManagement = useActiveSection(checklistData.secoes, []);

  // Use checklist functionality
  const checklistFunctionality = useChecklist(auditoriaId, checklistData.perguntas, setPontuacaoPorSecao);

  return {
    // Data from useChecklistData
    ...checklistData,
    
    // Section management
    ...sectionManagement,
    
    // Checklist functionality
    ...checklistFunctionality
  };
};