
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PageTitle } from "@/components/PageTitle";
import { db, Secao } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';
import { Edit, Layers, Plus, Trash2 } from 'lucide-react';

const AdminSecoes: React.FC = () => {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [secaoParaEditar, setSecaoParaEditar] = useState<Secao | null>(null);
  const [novaSecao, setNovaSecao] = useState({ nome: '' });
  const { toast } = useToast();
  
  useEffect(() => {
    // Carregar seções do banco de dados
    setSecoes(db.getSecoes());
  }, []);
  
  const handleAdicionarSecao = () => {
    if (!novaSecao.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o nome da seção.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já existe uma seção com o mesmo nome
    if (secoes.some(secao => secao.nome.toLowerCase() === novaSecao.nome.toLowerCase())) {
      toast({
        title: "Nome duplicado",
        description: "Já existe uma seção com este nome.",
        variant: "destructive"
      });
      return;
    }
    
    const adicionada = db.addSecao(novaSecao);
    setSecoes([...secoes, adicionada]);
    setNovaSecao({ nome: '' });
    
    toast({
      title: "Seção adicionada",
      description: `Seção ${adicionada.nome} foi adicionada com sucesso.`
    });
  };
  
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
    
    // Verificar se já existe outra seção com o mesmo nome (exceto a própria)
    if (secoes.some(secao => 
      secao.nome.toLowerCase() === secaoParaEditar.nome.toLowerCase() && 
      secao.id !== secaoParaEditar.id)
    ) {
      toast({
        title: "Nome duplicado",
        description: "Já existe uma seção com este nome.",
        variant: "destructive"
      });
      return;
    }
    
    db.updateSecao(secaoParaEditar);
    setSecoes(secoes.map(secao => secao.id === secaoParaEditar.id ? secaoParaEditar : secao));
    setSecaoParaEditar(null);
    
    toast({
      title: "Seção atualizada",
      description: `Seção ${secaoParaEditar.nome} foi atualizada com sucesso.`
    });
  };
  
  const handleExcluirSecao = (id: number) => {
    // Verificar se há perguntas associadas a esta seção
    const perguntas = db.getPerguntas();
    const temPerguntas = perguntas.some(pergunta => pergunta.secao_id === id);
    
    if (temPerguntas) {
      toast({
        title: "Não é possível excluir",
        description: "Esta seção possui perguntas associadas. Exclua as perguntas primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    db.deleteSecao(id);
    setSecoes(secoes.filter(secao => secao.id !== id));
    
    toast({
      title: "Seção excluída",
      description: "A seção foi excluída com sucesso."
    });
  };
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Seções" 
        description="Adicione, edite e remova seções do checklist"
      />
      
      <div className="flex justify-end mb-6">
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
                <Input
                  id="nome"
                  value={novaSecao.nome}
                  onChange={(e) => setNovaSecao({ nome: e.target.value })}
                  className="col-span-3"
                  placeholder="Limpeza"
                />
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Seções Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as seções disponíveis para o checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {secoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {secoes.map((secao) => (
                  <TableRow key={secao.id}>
                    <TableCell className="font-medium">{secao.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Layers className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma seção cadastrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione sua primeira seção clicando no botão "Nova Seção".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecoes;
