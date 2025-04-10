
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
    console.log(`handleRespostaWrapped chamado para pergunta ${perguntaId} com ${resposta}`);
    if (respostasExistentes) {
      handleRespostaBase(perguntaId, resposta, respostasExistentes, perguntas);
      updateIncompleteSections();
    } else {
      console.error("Não há respostasExistentes para passar ao handleRespostaBase");
      // Tentar mesmo assim, com um array vazio
      handleRespostaBase(perguntaId, resposta, [], perguntas);
      updateIncompleteSections();
    }
  };

  /**
   * Wrapper for handleFileUpload to include respostasExistentes
   */
  const handleFileUploadWrapped = (perguntaId: string, file: File) => {
    if (respostasExistentes) {
      handleFileUploadBase(perguntaId, file, respostasExistentes);
    } else {
      // Tentar mesmo assim, com um array vazio
      handleFileUploadBase(perguntaId, file, []);
    }
  };

  /**
   * Wrapper for handleSaveObservacao to include respostasExistentes
   */
  const handleSaveObservacaoWrapped = (perguntaId: string) => {
    if (respostasExistentes) {
      handleSaveObservacaoBase(perguntaId, respostasExistentes);
    } else {
      // Tentar mesmo assim, com um array vazio
      handleSaveObservacaoBase(perguntaId, []);
    }
  };

  return {
    handleRespostaWrapped,
    handleFileUploadWrapped,
    handleSaveObservacaoWrapped
  };
};
