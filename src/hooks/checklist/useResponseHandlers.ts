
import { RespostaValor } from '@/components/checklist/ChecklistQuestion';
import { Pergunta } from '@/lib/types';

/**
 * Hook for handling response-related functions
 */
export const useResponseHandlers = (
  handleRespostaBase: (perguntaId: string, resposta: RespostaValor, respostasExistentes: any[], perguntas?: Pergunta[]) => void,
  handleFileUploadBase: (perguntaId: string, file: File, respostasExistentes: any[]) => void,
  handleSaveObservacaoBase: (perguntaId: string, respostasExistentes: any[]) => void,
  respostasExistentes: any[] | undefined,
  perguntas: Pergunta[] | undefined,
  updateIncompleteSections: () => void
) => {
  /**
   * Wrapper for handleResposta to include respostasExistentes and update incomplete sections
   */
  const handleRespostaWrapped = (perguntaId: string, resposta: RespostaValor) => {
    if (respostasExistentes && perguntas) {
      handleRespostaBase(perguntaId, resposta, respostasExistentes, perguntas);
      updateIncompleteSections();
    }
  };

  /**
   * Wrapper for handleFileUpload to include respostasExistentes
   */
  const handleFileUploadWrapped = (perguntaId: string, file: File) => {
    if (respostasExistentes) {
      handleFileUploadBase(perguntaId, file, respostasExistentes);
    }
  };

  /**
   * Wrapper for handleSaveObservacao to include respostasExistentes
   */
  const handleSaveObservacaoWrapped = (perguntaId: string) => {
    if (respostasExistentes) {
      handleSaveObservacaoBase(perguntaId, respostasExistentes);
    }
  };

  return {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  };
};
