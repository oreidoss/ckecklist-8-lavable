
import React from 'react';
import { Usuario } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';

interface UserSelectorsProps {
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
}

const useUserSelectors = ({
  auditoriaId,
  supervisor,
  gerente,
  setIsEditingSupervisor,
  setIsEditingGerente,
  setSupervisor,
  setGerente,
  refetchAuditoria
}: UserSelectorsProps) => {
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
    return usuarios.filter(u => 
      u.role === 'supervisor' || 
      u.funcao === 'supervisor' || 
      u.email?.toLowerCase().includes('supervisor') || 
      u.nome?.toLowerCase().includes('supervisor')
    );
  };
  
  const getGerentes = (usuarios: Usuario[]) => {
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

// The component for rendering User Selectors (supervisor/gerente)
const UserSelectorsComponent: React.FC<UserSelectorsProps> = (props) => {
  const {
    supervisor,
    gerente,
    isEditingSupervisor,
    isEditingGerente,
    usuarios,
    setIsEditingSupervisor,
    setIsEditingGerente,
    setSupervisor,
    setGerente
  } = props;

  const {
    handleSaveSupervisor,
    handleSaveGerente,
    getSupervisores,
    getGerentes
  } = useUserSelectors(props);

  // Get filtered lists
  const supervisores = getSupervisores(usuarios);
  const gerentes = getGerentes(usuarios);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">Supervisor(a):</span>
        {isEditingSupervisor ? (
          <div className="flex items-center">
            <Select value={supervisor} onValueChange={setSupervisor}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Selecione um supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisores.length > 0 ? (
                  supervisores.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.nome}>
                      {supervisor.nome}
                    </SelectItem>
                  ))
                ) : (
                  usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={handleSaveSupervisor}
              title="Salvar"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="font-medium">{supervisor || "Nenhum supervisor definido"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={() => setIsEditingSupervisor(true)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">Gerente:</span>
        {isEditingGerente ? (
          <div className="flex items-center">
            <Select value={gerente} onValueChange={setGerente}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Selecione um gerente" />
              </SelectTrigger>
              <SelectContent>
                {gerentes.length > 0 ? (
                  gerentes.map((gerente) => (
                    <SelectItem key={gerente.id} value={gerente.nome}>
                      {gerente.nome}
                    </SelectItem>
                  ))
                ) : (
                  usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={handleSaveGerente}
              title="Salvar"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="font-medium">{gerente || "Nenhum gerente definido"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={() => setIsEditingGerente(true)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export { UserSelectorsComponent };
export default useUserSelectors;
