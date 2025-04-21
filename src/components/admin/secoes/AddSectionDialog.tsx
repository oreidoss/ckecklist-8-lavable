
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const AddSectionDialog: React.FC = () => {
  const [novaSecao, setNovaSecao] = useState({ nome: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');

  const adicionarSecaoMutation = useMutation({
    mutationFn: async (novaSecao: { nome: string }) => {
      const { data, error } = await supabase
        .from('secoes')
        .insert([{ nome: novaSecao.nome }])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secoes'] });
      setNovaSecao({ nome: '' });
      setErrorMessage('');
      toast({
        title: "Seção adicionada",
        description: "A seção foi adicionada com sucesso."
      });
    },
    onError: (error: any) => {
      // Check for duplicate error (constraint violation)
      if (
        error &&
        error.code === '23505' && // unique_violation
        typeof error.message === 'string' &&
        error.message.includes('unique_nome')
      ) {
        setErrorMessage('Já existe uma seção com esse nome.');
      } else {
        setErrorMessage('');
        toast({
          title: "Erro ao adicionar seção",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  });

  const handleAdicionarSecao = () => {
    if (!novaSecao.nome) {
      setErrorMessage('');
      toast({
        title: "Campo obrigatório",
        description: "Preencha o nome da seção.",
        variant: "destructive"
      });
      return;
    }
    setErrorMessage('');
    adicionarSecaoMutation.mutate(novaSecao);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Seção
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Seção</DialogTitle>
          <DialogDescription>
            Preencha o campo abaixo para adicionar uma nova seção.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <div className="col-span-3 flex flex-col space-y-2">
              <Input
                id="nome"
                value={novaSecao.nome}
                onChange={(e) => setNovaSecao({ nome: e.target.value })}
                className="col-span-3"
                placeholder="Limpeza"
              />
              {errorMessage && (
                <span className="text-sm text-destructive">{errorMessage}</span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleAdicionarSecao}>Adicionar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
