
import { useChecklistCoreState } from './useChecklistCoreState';
import { useChecklistProgressState } from './useChecklistProgressState';

export const useChecklistPageState = (
  auditoriaId: string | undefined,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Use core state management (data, active section, basic functionality)
  const coreState = useChecklistCoreState(auditoriaId, setPontuacaoPorSecao);

  // Use progress and navigation state management
  const progressState = useChecklistProgressState({
    activeSecao: coreState.activeSecao,
    setActiveSecao: coreState.setActiveSecao,
    secoes: coreState.secoes,
    perguntas: coreState.perguntas,
    respostas: coreState.respostas,
    respostasExistentes: coreState.respostasExistentes,
    handleResposta: coreState.handleResposta,
    handleFileUpload: coreState.handleFileUpload,
    handleSaveObservacao: coreState.handleSaveObservacao,
    saveAllResponses: coreState.saveAllResponses,
    refetchRespostas: () => coreState.refetchRespostas()
  });

  // Return combined state and functionality
  return {
    // Core state (data, basic functionality)
    ...coreState,
    
    // Progress and navigation state
    ...progressState
  };
};
