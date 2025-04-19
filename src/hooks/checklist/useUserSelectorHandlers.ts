
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Usuario } from '@/lib/types';

type UseUserSelectorHandlersProps = {
  auditoriaId: string | undefined;
  supervisor: string;
  gerente: string;
  isEditingSupervisor: boolean;
  isEditingGerente: boolean;
  usuarios: Usuario[];
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
      console.log("Salvando supervisor:", supervisor);
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
  const getSupervisores = (usuarios: Usuario[]) => {
    if (!usuarios || usuarios.length === 0) return [];
    
    return usuarios.filter(u => 
      u.role === 'supervisor' || 
      u.funcao === 'supervisor' || 
      (u.email && u.email.toLowerCase().includes('supervisor')) || 
      (u.nome && u.nome.toLowerCase().includes('supervisor'))
    );
  };
  
  const getGerentes = (usuarios: Usuario[]) => {
    if (!usuarios || usuarios.length === 0) return [];
    
    return usuarios.filter(u => 
      u.role === 'gerente' || 
      u.funcao === 'gerente' || 
      (u.email && u.email.toLowerCase().includes('gerente')) || 
      (u.nome && u.nome.toLowerCase().includes('gerente'))
    );
  };

  return {
    handleSaveSupervisor,
    handleSaveGerente,
    getSupervisores,
    getGerentes
  };
};
