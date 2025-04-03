
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save } from 'lucide-react';

interface EditInformacoesDialogProps {
  auditoria: any;
  usuarios: any[];
  supervisores?: any[]; // Added this prop
  gerentes?: any[]; // Added this prop
  refetchAuditoria: () => void;
}

export const EditInformacoesDialog: React.FC<EditInformacoesDialogProps> = ({
  auditoria,
  usuarios,
  supervisores = [], // Default to empty array if not provided
  gerentes = [], // Default to empty array if not provided
  refetchAuditoria
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Create a form with react-hook-form
  const form = useForm({
    defaultValues: {
      gerente: auditoria.gerente || '',
      supervisor: auditoria.supervisor || ''
    }
  });
  
  // Update form values when auditoria changes
  React.useEffect(() => {
    form.reset({
      gerente: auditoria.gerente || '',
      supervisor: auditoria.supervisor || ''
    });
  }, [auditoria, form]);

  // Update manager and supervisor information
  const atualizarInformacoes = async (values: { gerente: string; supervisor: string }) => {
    if (!auditoria) return;
    
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({
          gerente: values.gerente,
          supervisor: values.supervisor
        })
        .eq('id', auditoria.id);
      
      if (error) throw error;
      
      toast({
        title: "Informações atualizadas",
        description: "Os dados da auditoria foram atualizados com sucesso!",
      });
      
      setDialogOpen(false);
      refetchAuditoria();
    } catch (error) {
      console.error('Error updating audit information:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações.",
        variant: "destructive"
      });
    }
  };

  // Use the filtered lists if provided, otherwise use all usuarios
  const supervisorOptions = supervisores.length > 0 ? supervisores : usuarios;
  const gerenteOptions = gerentes.length > 0 ? gerentes : usuarios;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Informações
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Informações da Auditoria</DialogTitle>
          <DialogDescription>
            Atualize os dados do gerente e supervisor desta auditoria.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(atualizarInformacoes)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="supervisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor(a)</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value || "no-supervisor"} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-supervisor">Selecione um supervisor</SelectItem>
                        {supervisorOptions?.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.nome}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gerente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gerente da Loja</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value || "no-gerente"} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um gerente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-gerente">Selecione um gerente</SelectItem>
                        {gerenteOptions?.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.nome}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
