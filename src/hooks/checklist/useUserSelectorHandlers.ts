
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UseUserSelectorHandlersProps = {
  auditoriaId: string | undefined;
  supervisor: string;
  gerente: string;
  isEditingSupervisor: boolean;
  isEditingGerente: boolean;
  usuarios: any[];
  setIsEditingSupervisor: (value: boolean) => void;
  setIsEditingGerente: (value: boolean) => void;
  setSupervisor: (value: string) => void;
  setGerente: (value: string) => void;
  refetchAuditoria: () => void;
};

export const useUserSelectorHandlers = (props: UseUserSelectorHandlersProps) => {
  const {
    auditoriaId,
    supervisor,
    gerente,
    setIsEditingSupervisor,
    setIsEditingGerente,
    setSupervisor,
    setGerente,
    refetchAuditoria
  } = props;
  
  const { toast } = useToast();

  const handleSaveSupervisor = async () => {
    if (!auditoriaId) return;
    
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({ supervisor })
        .eq('id', auditoriaId);
      
      if (error) throw error;
      
      setIsEditingSupervisor(false);
      refetchAuditoria();
      
      toast({
        title: "Supervisor(a) atualizado(a)",
        description: "Nome do supervisor(a) foi salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar supervisor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o nome do supervisor(a).",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveGerente = async () => {
    if (!auditoriaId) return;
    
    try {
      console.log("Salvando gerente:", gerente);
      const { error } = await supabase
        .from('auditorias')
        .update({ gerente })
        .eq('id', auditoriaId);
      
      if (error) throw error;
      
      setIsEditingGerente(false);
      refetchAuditoria();
      
      toast({
        title: "Gerente atualizado(a)",
        description: "Nome do gerente foi salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar gerente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o nome do gerente.",
        variant: "destructive"
      });
    }
  };

  // Filter users by role
  const getSupervisores = (usuarios: any[]) => {
    return usuarios.filter(u => 
      u.role === 'supervisor' || 
      u.funcao === 'supervisor' || 
      u.email?.toLowerCase().includes('supervisor') || 
      u.nome?.toLowerCase().includes('supervisor')
    );
  };
  
  const getGerentes = (usuarios: any[]) => {
    return usuarios.filter(u => 
      u.role === 'gerente' || 
      u.funcao === 'gerente' || 
      u.email?.toLowerCase().includes('gerente') || 
      u.nome?.toLowerCase().includes('gerente')
    );
  };

  return {
    handleSaveSupervisor,
    handleSaveGerente,
    getSupervisores,
    getGerentes
  };
};
