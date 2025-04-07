
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to handle batch saving of responses
 */
export const useSaveResponses = (
  auditoriaId: string | undefined,
  updatePontuacaoPorSecao: () => Promise<void>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Function to save all responses at once (for use with Next button)
  const saveAllResponses = async (): Promise<void> => {
    if (!auditoriaId) return;
    
    setIsSaving(true);
    
    try {
      // Since responses are already being saved individually when selected,
      // we just need to ensure the section scores are updated
      await updatePontuacaoPorSecao();
      
      toast({
        title: "Seção salva",
        description: "Todas as respostas desta seção foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar respostas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as respostas.",
        variant: "destructive"
      });
      throw error; // Propagate error for handling in the UI
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveAllResponses,
    isSaving,
    setIsSaving
  };
};
