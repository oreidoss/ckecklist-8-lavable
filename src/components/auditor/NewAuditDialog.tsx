
import React, { useState } from 'react';
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

  // Filter users by role
  const supervisores = usuarios?.filter(u => u.role === 'supervisor' || u.email.includes('supervisor')) || [];
  const gerentes = usuarios?.filter(u => u.role === 'gerente' || u.email.includes('gerente')) || [];

  const createNewAudit = async () => {
    if (isCreatingAudit || !selectedLoja) return;
    setIsCreatingAudit(true);

    try {
      const supervisorNome = usuarios?.find(u => u.id === selectedSupervisor)?.nome || null;
      const gerenteNome = usuarios?.find(u => u.id === selectedGerente)?.nome || null;
      
      const { data, error } = await supabase
        .from('auditorias')
        .insert({
          loja_id: selectedLoja,
          usuario_id: selectedSupervisor,
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
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
