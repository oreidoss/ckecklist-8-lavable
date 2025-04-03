
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Edit, Layers, Trash2, HelpCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

type Secao = {
  id: string;
  nome: string;
};

type Pergunta = {
  id: string;
  texto: string;
  secao_id: string;
};

interface SectionTableProps {
  secoes: Secao[];
  isLoading: boolean;
  perguntas: Pergunta[];
}

export const SectionTable: React.FC<SectionTableProps> = ({ 
  secoes, 
  isLoading, 
  perguntas 
}) => {
  const [secaoParaEditar, setSecaoParaEditar] = useState<Secao | null>(null);
  const [secaoSelecionada, setSecaoSelecionada] = useState<Secao | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Mutations for CRUD operations
  const atualizarSecaoMutation = useMutation({
    mutationFn: async (secao: Secao) => {
      const { data, error } = await supabase
        .from('secoes')
        .update({ nome: secao.nome })
        .eq('id', secao.id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secoes'] });
      setSecaoParaEditar(null);
      toast({
        title: "Seção atualizada",
        description: "A seção foi atualizada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar seção",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const excluirSecaoMutation = useMutation({
    mutationFn: async (id: string) => {
      // Primeiro verificamos se há perguntas relacionadas
      const { data: perguntasRelacionadas } = await supabase
        .from('perguntas')
        .select('id')
        .eq('secao_id', id);
      
      if (perguntasRelacionadas && perguntasRelacionadas.length > 0) {
        throw new Error("Esta seção possui perguntas associadas. Exclua as perguntas primeiro.");
      }
      
      const { error } = await supabase
        .from('secoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secoes'] });
      toast({
        title: "Seção excluída",
        description: "A seção foi excluída com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir seção",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAtualizarSecao = () => {
    if (!secaoParaEditar) return;
    
    if (!secaoParaEditar.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o nome da seção.",
        variant: "destructive"
      });
      return;
    }
    
    atualizarSecaoMutation.mutate(secaoParaEditar);
  };
  
  const handleExcluirSecao = (id: string) => {
    excluirSecaoMutation.mutate(id);
  };

  const perguntasPorSecao = (secaoId: string) => {
    return perguntas.filter(pergunta => pergunta.secao_id === secaoId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (secoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Layers className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma seção cadastrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione sua primeira seção clicando no botão "Nova Seção".
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Nº de Perguntas</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {secoes.map((secao) => (
          <TableRow key={secao.id}>
            <TableCell className="font-medium">{secao.nome}</TableCell>
            <TableCell>{perguntasPorSecao(secao.id).length}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSecaoSelecionada(secao)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className={isMobile ? "w-full" : "w-[500px]"}>
                    <SheetHeader>
                      <SheetTitle>Perguntas da Seção: {secaoSelecionada?.nome}</SheetTitle>
                      <SheetDescription>
                        Lista de perguntas relacionadas a esta seção.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      {secaoSelecionada && perguntasPorSecao(secaoSelecionada.id).length > 0 ? (
                        <ul className="space-y-2">
                          {perguntasPorSecao(secaoSelecionada.id).map((pergunta) => (
                            <li key={pergunta.id} className="p-3 border rounded-md">
                              {pergunta.texto}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          Nenhuma pergunta cadastrada para esta seção.
                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <SheetClose asChild>
                          <Button>Fechar</Button>
                        </SheetClose>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSecaoParaEditar(secao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Seção</DialogTitle>
                      <DialogDescription>
                        Altere o nome da seção conforme necessário.
                      </DialogDescription>
                    </DialogHeader>
                    {secaoParaEditar && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-nome" className="text-right">
                            Nome
                          </Label>
                          <Input
                            id="edit-nome"
                            value={secaoParaEditar.nome}
                            onChange={(e) => setSecaoParaEditar({ 
                              ...secaoParaEditar, 
                              nome: e.target.value 
                            })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleAtualizarSecao}>Salvar Alterações</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Seção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a seção "{secao.nome}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleExcluirSecao(secao.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
