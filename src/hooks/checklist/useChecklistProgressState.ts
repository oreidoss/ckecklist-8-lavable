import { useSaveProgress } from './useSaveProgress';
import { useResponseHandlers } from './useResponseHandlers';
import { useNavigationHandlers } from './useNavigationHandlers';
import { useSectionNavigation } from './useSectionNavigation';
import { useCompletionPercentage } from './useCompletionPercentage';
import { Secao, Pergunta } from '@/lib/types';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';

interface UseChecklistProgressStateProps {
  activeSecao: string | null;
  setActiveSecao: (secaoId: string) => void;
  secoes: Secao[] | undefined;
  perguntas: Pergunta[] | undefined;
  respostas: Record<string, RespostaValor>;
  respostasExistentes: any[] | undefined;
  handleResposta: (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => Promise<void>;
  handleFileUpload: (perguntaId: string, file: File, respostasExistentes: any[]) => Promise<void>;
  handleSaveObservacao: (perguntaId: string, respostasExistentes: any[]) => Promise<void>;
  saveAllResponses: () => Promise<void>;
  refetchRespostas: () => Promise<any>;
}

/**
 * Hook para gerenciar progresso, navegação e handlers do checklist
 */
export const useChecklistProgressState = ({
  activeSecao,
  setActiveSecao,
  secoes,
  perguntas,
  respostas,
  respostasExistentes,
  handleResposta,
  handleFileUpload,
  handleSaveObservacao,
  saveAllResponses,
  refetchRespostas
}: UseChecklistProgressStateProps) => {
  // Use section navigation
  const sectionNavigation = useSectionNavigation({
    secoes,
    perguntas,
    respostas,
    activeSecao,
    setActiveSecao
  });

  // Use completion percentage calculation
  const completionData = useCompletionPercentage({
    secoes,
    perguntas,
    respostas,
    respostasExistentes
  });

  // Função wrapper garantindo retorno booleano explícito
  const saveAllAndReturnBoolean = async (respostasExistentes: any[]): Promise<boolean> => {
    try {
      await saveAllResponses();
      console.log("saveAllAndReturnBoolean: respostas salvas com sucesso");
      await refetchRespostas();
      return true;
    } catch (error) {
      console.error("Error in saveAllAndReturnBoolean:", error);
      return false;
    }
  };

  // Use save progress functionality
  const saveProgress = useSaveProgress(
    saveAllResponses,
    saveAllAndReturnBoolean
  );
  
  // Use response handlers
  const responseHandlers = useResponseHandlers(
    (perguntaId: string, resposta: RespostaValor) => handleResposta(perguntaId, resposta, respostasExistentes || [], perguntas),
    (perguntaId: string, file: File) => handleFileUpload(perguntaId, file, respostasExistentes || []),
    (perguntaId: string) => handleSaveObservacao(perguntaId, respostasExistentes || []),
    respostasExistentes,
    perguntas,
    sectionNavigation.updateIncompleteSections
  );

  // Use navigation handlers
  const navigationHandlers = useNavigationHandlers(
    activeSecao,
    setActiveSecao,
    secoes,
    sectionNavigation.goToNextSection,
    sectionNavigation.goToPreviousSection,
    saveAllResponses,
    saveProgress.saveAndNavigateHome
  );

  return {
    // Section navigation
    ...sectionNavigation,
    
    // Completion data
    ...completionData,
    
    // Save progress
    ...saveProgress,
    
    // Response handlers  
    ...responseHandlers,
    
    // Navigation handlers
    ...navigationHandlers,
    
    // Additional methods
    saveAllAndReturnBoolean
  };
};