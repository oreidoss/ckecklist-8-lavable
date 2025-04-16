
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Database } from '@/integrations/supabase/types';

type Usuario = Database['public']['Tables']['usuarios']['Row'] & {
  role?: string;
};

interface NewAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarios?: Usuario[];
  selectedLoja: string | null;
  isCreatingAudit: boolean;
  setIsCreatingAudit: (isCreating: boolean) => void;
}

export const NewAuditDialog: React.FC<NewAuditDialogProps> = ({
  open,
  onOpenChange,
  usuarios,
  selectedLoja,
  isCreatingAudit,
  setIsCreatingAudit
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
  const [selectedGerente, setSelectedGerente] = useState<string | null>(null);
  
  // Add logs for debugging
  console.log("Usuarios disponíveis:", usuarios);
  
  // Improved filtering logic to find supervisors and managers
  const supervisores = usuarios?.filter(u => 
    u.role === 'supervisor' || 
    u.funcao === 'supervisor' || 
    u.email?.toLowerCase().includes('supervisor') || 
    u.nome?.toLowerCase().includes('supervisor')
  ) || [];
  
  const gerentes = usuarios?.filter(u => 
    u.role === 'gerente' || 
    u.funcao === 'gerente' || 
    u.email?.toLowerCase().includes('gerente') || 
    u.nome?.toLowerCase().includes('gerente')
  ) || [];
  
  console.log("Supervisores filtrados:", supervisores);
  console.log("Gerentes filtrados:", gerentes);

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      // Set defaults to null to ensure user makes a selection
      setSelectedSupervisor(supervisores.length > 0 ? supervisores[0].id : null);
      setSelectedGerente(gerentes.length > 0 ? gerentes[0].id : null);
    }
  }, [open, supervisores, gerentes]);

  const createNewAudit = async () => {
    if (isCreatingAudit || !selectedLoja) return;
    setIsCreatingAudit(true);

    try {
      // Get supervisor and manager names from selected IDs
      const supervisorUser = usuarios?.find(u => u.id === selectedSupervisor);
      const gerenteUser = usuarios?.find(u => u.id === selectedGerente);
      
      console.log("Usuario supervisor selecionado:", supervisorUser);
      console.log("Usuario gerente selecionado:", gerenteUser);
      
      // Use the found names or empty strings
      const supervisorNome = supervisorUser?.nome || "";
      const gerenteNome = gerenteUser?.nome || "";
      
      console.log("Nome supervisor a ser salvo:", supervisorNome);
      console.log("Nome gerente a ser salvo:", gerenteNome);
      
      const { data, error } = await supabase
        .from('auditorias')
        .insert({
          loja_id: selectedLoja,
          usuario_id: selectedSupervisor || null,
          supervisor: supervisorNome,
          gerente: gerenteNome,
          data: new Date().toISOString(),
          status: 'em_andamento',
          pontuacao_total: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Auditoria criada",
        description: "Nova auditoria iniciada com sucesso!",
      });
      
      navigate(`/checklist/${data.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAudit(false);
      onOpenChange(false);
    }
  };

  const handleCreateAuditAnyway = () => {
    if (!selectedLoja) return;
    
    // Use any supervisor, or a default name if none exists
    const supervisorId = selectedSupervisor || (usuarios?.length ? usuarios[0].id : null);
    
    // Use default supervisor name if no supervisor selected
    setSelectedSupervisor(supervisorId);
    createNewAudit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Auditoria</DialogTitle>
          <DialogDescription>
            Selecione o supervisor e gerente para a auditoria
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supervisor" className="text-right">
              Supervisor
            </Label>
            <div className="col-span-3">
              <Select 
                value={selectedSupervisor || ""}
                onValueChange={value => setSelectedSupervisor(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {supervisores.length > 0 ? (
                    supervisores.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.nome}
                      </SelectItem>
                    ))
                  ) : usuarios?.length ? (
                    usuarios.map(usuario => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome} {!usuario.role && "(sem função definida)"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum supervisor disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gerente" className="text-right">
              Gerente
            </Label>
            <div className="col-span-3">
              <Select 
                value={selectedGerente || ""}
                onValueChange={value => setSelectedGerente(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um gerente" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {gerentes.length > 0 ? (
                    gerentes.map(gerente => (
                      <SelectItem key={gerente.id} value={gerente.id}>
                        {gerente.nome}
                      </SelectItem>
                    ))
                  ) : usuarios?.length ? (
                    usuarios.map(usuario => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome} {!usuario.role && "(sem função definida)"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum gerente disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={createNewAudit} 
            disabled={isCreatingAudit}
          >
            {isCreatingAudit ? "Criando..." : "Iniciar Auditoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
