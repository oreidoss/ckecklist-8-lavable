
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useChecklistSave } from './useChecklistSave';

/**
 * Hook for managing the save progress functionality
 */
export const useSaveProgress = (
  saveAllResponses: () => Promise<void>,
  saveAllAndReturnBoolean: (respostasExistentes: any[]) => Promise<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Navigate to home page after saving
  const saveAndNavigateHome = async (respostasExistentes: any[]): Promise<boolean> => {
    try {
      const result = await saveAllAndReturnBoolean(respostasExistentes);
      
      if (result) {
        toast({
          title: "Sucesso",
          description: "Checklist salvo com sucesso!"
        });
        
        navigate('/');
      }
      
      return result;
    } catch (error) {
      console.error("Error in saveAndNavigateHome:", error);
      return false;
    }
  };

  return {
    isSendingEmail,
    setIsSendingEmail,
    saveAndNavigateHome
  };
};
