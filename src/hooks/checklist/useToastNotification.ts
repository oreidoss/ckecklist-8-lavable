
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing toast notifications
 */
export const useToastNotification = () => {
  const { toast } = useToast();
  
  const showEditModeToast = (isEditing: boolean) => {
    setTimeout(() => {
      toast({
        title: isEditing ? "Modo visualização ativado" : "Modo edição ativado",
        description: isEditing 
          ? "As respostas desta seção agora estão em modo visualização."
          : "Você agora pode editar as respostas desta seção.",
      });
    }, 100);
  };
  
  const showNavigationSuccessToast = () => {
    toast({
      title: "Navegação bem-sucedida",
      description: "Respostas salvas e navegando para próxima seção.",
    });
  };
  
  const showNavigationErrorToast = () => {
    toast({
      title: "Erro ao navegar",
      description: "Ocorreu um erro ao salvar as respostas antes de navegar. Tente novamente.",
      variant: "destructive"
    });
  };
  
  return {
    showEditModeToast,
    showNavigationSuccessToast,
    showNavigationErrorToast
  };
};
