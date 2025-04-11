
import { useToast } from '@/hooks/use-toast';
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta, Secao } from '@/lib/types';

/**
 * Hook that combines response handling and navigation logic for the checklist
 */
export const useCombinedChecklistLogic = (
  auditoriaId: string | undefined,
  activeSecao: string | null,
  editingSections: Record<string, boolean>,
  setEditingSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  secoes: Secao[] | undefined,
  respostas: Record<string, RespostaValor>,
  setRespostas: React.Dispatch<React.SetStateAction<Record<string, RespostaValor>>>,
  observacoes: Record<string, string>,
  fileUrls: Record<string, string>,
  respostasExistentes: any[] | undefined,
  perguntas: Pergunta[] | undefined,
  setProgresso: React.Dispatch<React.SetStateAction<number>>,
  updateIncompleteSections: () => void,
  goToNextSection: () => void,
  setPontuacaoPorSecao?: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  const toast = useToast();
  
  const { 
    handleResposta,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacao,
    handleSaveObservacaoWrapped,
    handleFileUpload,
    handleFileUploadWrapped,
    saveAllResponses,
    saveAndNavigateHome,
    saveAndNavigateToNextSection,
    isSaving
  } = useChecklistResponses(
    auditoriaId, 
    activeSecao, 
    editingSections,
    setEditingSections,
    secoes, 
    respostas, 
    setRespostas, 
    observacoes, 
    fileUrls, 
    respostasExistentes, 
    perguntas, 
    setProgresso, 
    updateIncompleteSections, 
    goToNextSection,
    toast, 
    setPontuacaoPorSecao
  );

  return {
    handleResposta,
    handleRespostaWrapped,
    handleObservacaoChange,
    handleSaveObservacao,
    handleSaveObservacaoWrapped,
    handleFileUpload,
    handleFileUploadWrapped,
    saveAllResponses,
    saveAndNavigateHome,
    saveAndNavigateToNextSection,
    isSaving
  };
};

// Import from existing file to avoid circular dependencies
import { useChecklistResponses } from './useChecklistResponses';
