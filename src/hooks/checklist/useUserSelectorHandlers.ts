
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

  // Improved users filtering by role
  const getSupervisores = (usuarios: Usuario[]) => {
    if (!usuarios || usuarios.length === 0) return [];
    
    console.log("Filtrando supervisores de:", usuarios);
    
    return usuarios.filter(u => {
      // Check multiple fields to determine if user is a supervisor
      const isSupervisorByRole = u.role === 'supervisor' || u.funcao === 'supervisor';
      const isSupervisorByEmail = u.email && u.email.toLowerCase().includes('supervisor');
      const isSupervisorByName = u.nome && u.nome.toLowerCase().includes('supervisor');
      
      const isSupervisor = isSupervisorByRole || isSupervisorByEmail || isSupervisorByName;
      
      if (isSupervisor) {
        console.log("Encontrado supervisor:", u.nome);
      }
      
      return isSupervisor;
    });
  };
  
  const getGerentes = (usuarios: Usuario[]) => {
    if (!usuarios || usuarios.length === 0) return [];
    
    console.log("Filtrando gerentes de:", usuarios);
    
    return usuarios.filter(u => {
      // Check multiple fields to determine if user is a manager
      const isGerenteByRole = u.role === 'gerente' || u.funcao === 'gerente';
      const isGerenteByEmail = u.email && u.email.toLowerCase().includes('gerente');
      const isGerenteByName = u.nome && u.nome.toLowerCase().includes('gerente');
      
      const isGerente = isGerenteByRole || isGerenteByEmail || isGerenteByName;
      
      if (isGerente) {
        console.log("Encontrado gerente:", u.nome);
      }
      
      return isGerente;
    });
  };

  return {
    handleSaveSupervisor,
    handleSaveGerente,
    getSupervisores,
    getGerentes
  };
};
