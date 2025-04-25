
import React, { createContext, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklistPageState } from '@/hooks/checklist/useChecklistPageState';
import { useUserSelectorHandlers } from '@/hooks/checklist/useUserSelectorHandlers';
import { useToast } from '@/hooks/use-toast';

interface ChecklistContextType {
  auditoriaId?: string;
  pageState: ReturnType<typeof useChecklistPageState>;
  userHandlers: ReturnType<typeof useUserSelectorHandlers>;
  saveAndNavigateHome: () => Promise<boolean>;
  navigate: ReturnType<typeof useNavigate>;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
};

export const ChecklistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auditoriaId } = useParams<{ auditoriaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pontuacaoPorSecao, setPontuacaoPorSecao] = React.useState<Record<string, number>>({});

  // Pass setPontuacaoPorSecao to useChecklistPageState
  const pageState = useChecklistPageState(auditoriaId, setPontuacaoPorSecao);
  
  const userHandlers = useUserSelectorHandlers({
    auditoriaId,
    supervisor: pageState.supervisor,
    gerente: pageState.gerente,
    isEditingSupervisor: pageState.isEditingSupervisor,
    isEditingGerente: pageState.isEditingGerente,
    usuarios: pageState.usuarios || [],
    setIsEditingSupervisor: pageState.setIsEditingSupervisor,
    setIsEditingGerente: pageState.setIsEditingGerente,
    setSupervisor: pageState.setSupervisor,
    setGerente: pageState.setGerente,
    refetchAuditoria: pageState.refetchAuditoria
  });

  const saveAndNavigateHome = async () => {
    if (pageState.respostasExistentes) {
      try {
        console.log("Iniciando saveAndNavigateHome com", pageState.respostasExistentes.length, "respostas");
        const success = await pageState.saveAndNavigateHomeBase(pageState.respostasExistentes);
        
        if (success) {
          console.log("Navegando para home após salvar");
          navigate('/');
        }
        return success;
      } catch (error: any) {
        console.error("Erro ao salvar e navegar:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o checklist: " + (error.message || "erro desconhecido"),
          variant: "destructive"
        });
        return false;
      }
    }
    return false;
  };

  return (
    <ChecklistContext.Provider 
      value={{
        auditoriaId,
        pageState, // pageState already includes pontuacaoPorSecao now
        userHandlers,
        saveAndNavigateHome,
        navigate
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};
