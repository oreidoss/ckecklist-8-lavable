
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

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      // Auto-select first supervisor if available
      if (supervisores.length > 0 && !selectedSupervisor) {
        setSelectedSupervisor(supervisores[0].id);
      }
      
      // Auto-select first gerente if available
      if (gerentes.length > 0 && !selectedGerente) {
        setSelectedGerente(gerentes[0].id);
      }
    }
  }, [open, supervisores, gerentes]);

  const createNewAudit = async () => {
    if (isCreatingAudit || !selectedLoja) return;
    setIsCreatingAudit(true);

    try {
      const supervisorNome = usuarios?.find(u => u.id === selectedSupervisor)?.nome || "Supervisor Padrão";
      const gerenteNome = usuarios?.find(u => u.id === selectedGerente)?.nome || "Gerente Padrão";
      
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
    const supervisorNome = supervisorId ? 
      (usuarios?.find(u => u.id === supervisorId)?.nome || "Supervisor Padrão") : 
      "Supervisor Padrão";

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
                onValueChange={setSelectedSupervisor}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisores.length > 0 ? (
                    supervisores.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.nome}
                      </SelectItem>
                    ))
                  ) : usuarios?.length ? (
                    // If no specific supervisors found, show all users as options
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
                onValueChange={setSelectedGerente}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um gerente" />
                </SelectTrigger>
                <SelectContent>
                  {gerentes.length > 0 ? (
                    gerentes.map(gerente => (
                      <SelectItem key={gerente.id} value={gerente.id}>
                        {gerente.nome}
                      </SelectItem>
                    ))
                  ) : usuarios?.length ? (
                    // If no specific gerentes found, show all users as options
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
          {(supervisores.length === 0 || gerentes.length === 0) && (
            <Button 
              onClick={handleCreateAuditAnyway} 
              disabled={isCreatingAudit}
              variant="secondary"
            >
              {isCreatingAudit ? "Criando..." : "Usar opções padrão"}
            </Button>
          )}
          <Button 
            onClick={createNewAudit} 
            disabled={!selectedSupervisor || isCreatingAudit}
          >
            {isCreatingAudit ? "Criando..." : "Iniciar Auditoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
