
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSaveProgress = (
  saveAllResponsesBase: () => Promise<void>,
  saveAndNavigateHomeBase: (respostasExistentes: any[]) => Promise<boolean>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const saveAndNavigateHome = async (respostasExistentes: any[] | undefined) => {
    if (!respostasExistentes) return false;
    
    try {
      await saveAllResponsesBase();
      const success = await saveAndNavigateHomeBase(respostasExistentes);
      if (success) {
        navigate('/');
      }
      return success;
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isSaving,
    setIsSaving,
    saveAndNavigateHome
  };
};
