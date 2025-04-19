
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAuditoriaDialogProps {
  auditoriaId: string;
  lojaNumero: string;
  lojaNome: string;
  onDeleted: () => void;
}

export const DeleteAuditoriaDialog: React.FC<DeleteAuditoriaDialogProps> = ({
  auditoriaId,
  lojaNumero,
  lojaNome,
  onDeleted
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // First delete all responses associated with this audit
      const { error: respostasError } = await supabase
        .from('respostas')
        .delete()
        .eq('auditoria_id', auditoriaId);

      if (respostasError) throw respostasError;

      // Then delete the audit itself
      const { error: auditoriaError } = await supabase
        .from('auditorias')
        .delete()
        .eq('id', auditoriaId);

      if (auditoriaError) throw auditoriaError;

      toast({
        title: "Auditoria excluída",
        description: "A auditoria e todas suas respostas foram excluídas com sucesso.",
      });
      
      onDeleted();
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a auditoria.",
        variant: "destructive",
      });
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Excluir auditoria"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente a auditoria da loja {lojaNumero} - {lojaNome} e 
              todas as suas respostas associadas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
