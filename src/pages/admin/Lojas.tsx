
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { Loja } from "@/lib/types";
import { lojaService } from "@/lib/services/lojaService";
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Store, Trash2 } from 'lucide-react';
import { EmptyUsuarios } from '@/components/admin/usuarios/EmptyUsuarios';

const AdminLojas: React.FC = () => {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lojaParaEditar, setLojaParaEditar] = useState<Loja | null>(null);
  const [novaLoja, setNovaLoja] = useState({ numero: '', nome: '' });
  const { toast } = useToast();
  
  const fetchLojas = async () => {
    setIsLoading(true);
    try {
      const fetchedLojas = await lojaService.getLojas();
      setLojas(fetchedLojas);
    } catch (error) {
      console.error("Error fetching lojas:", error);
      toast({
        title: "Erro ao carregar lojas",
        description: "Não foi possível carregar as lojas do sistema.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLojas();
  }, []);
  
  const handleAdicionarLoja = async () => {
    if (!novaLoja.numero || !novaLoja.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e o nome da loja.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já existe uma loja com o mesmo número
    if (lojas.some(loja => loja.numero === novaLoja.numero)) {
      toast({
        title: "Número duplicado",
        description: "Já existe uma loja com este número.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const adicionada = await lojaService.addLoja(novaLoja);
      setLojas([...lojas, adicionada]);
      setNovaLoja({ numero: '', nome: '' });
      
      toast({
        title: "Loja adicionada",
        description: `Loja ${adicionada.nome} foi adicionada com sucesso.`
      });
    } catch (error) {
      console.error("Error adding loja:", error);
      toast({
        title: "Erro ao adicionar loja",
        description: "Não foi possível adicionar a loja.",
        variant: "destructive"
      });
    }
  };
  
  const handleAtualizarLoja = async () => {
    if (!lojaParaEditar) return;
    
    if (!lojaParaEditar.numero || !lojaParaEditar.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e o nome da loja.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já existe outra loja com o mesmo número (exceto a própria)
    if (lojas.some(loja => loja.numero === lojaParaEditar.numero && loja.id !== lojaParaEditar.id)) {
      toast({
        title: "Número duplicado",
        description: "Já existe uma loja com este número.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await lojaService.updateLoja(lojaParaEditar);
      setLojas(lojas.map(loja => loja.id === lojaParaEditar.id ? lojaParaEditar : loja));
      setLojaParaEditar(null);
      
      toast({
        title: "Loja atualizada",
        description: `Loja ${lojaParaEditar.nome} foi atualizada com sucesso.`
      });
    } catch (error) {
      console.error("Error updating loja:", error);
      toast({
        title: "Erro ao atualizar loja",
        description: "Não foi possível atualizar a loja.",
        variant: "destructive"
      });
    }
  };
  
  const handleExcluirLoja = async (id: string) => {
    try {
      await lojaService.deleteLoja(id);
      setLojas(lojas.filter(loja => loja.id !== id));
      
      toast({
        title: "Loja excluída",
        description: "A loja foi excluída com sucesso."
      });
    } catch (error) {
      console.error("Error deleting loja:", error);
      toast({
        title: "Erro ao excluir loja",
        description: "Não foi possível excluir a loja.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Lojas" 
        description="Adicione, edite e remova lojas do sistema"
      />
      
      <div className="flex justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Loja</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova loja.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero" className="text-right">
                  Número
                </Label>
                <Input
                  id="numero"
                  value={novaLoja.numero}
                  onChange={(e) => setNovaLoja({ ...novaLoja, numero: e.target.value })}
                  className="col-span-3"
                  placeholder="001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={novaLoja.nome}
                  onChange={(e) => setNovaLoja({ ...novaLoja, nome: e.target.value })}
                  className="col-span-3"
                  placeholder="Loja Centro"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAdicionarLoja}>Adicionar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lojas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as lojas disponíveis para auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-pulse">Carregando lojas...</div>
            </div>
          ) : lojas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Número</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.map((loja) => (
                  <TableRow key={loja.id}>
                    <TableCell className="font-medium">{loja.numero}</TableCell>
                    <TableCell>{loja.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setLojaParaEditar(loja)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Loja</DialogTitle>
                              <DialogDescription>
                                Altere as informações da loja conforme necessário.
                              </DialogDescription>
                            </DialogHeader>
                            {lojaParaEditar && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-numero" className="text-right">
                                    Número
                                  </Label>
                                  <Input
                                    id="edit-numero"
                                    value={lojaParaEditar.numero}
                                    onChange={(e) => setLojaParaEditar({ 
                                      ...lojaParaEditar, 
                                      numero: e.target.value 
                                    })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-nome" className="text-right">
                                    Nome
                                  </Label>
                                  <Input
                                    id="edit-nome"
                                    value={lojaParaEditar.nome}
                                    onChange={(e) => setLojaParaEditar({ 
                                      ...lojaParaEditar, 
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
                                <Button onClick={handleAtualizarLoja}>Salvar Alterações</Button>
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
                              <AlertDialogTitle>Excluir Loja</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a loja "{loja.nome}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleExcluirLoja(loja.id)}
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
              <Store className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma loja cadastrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione sua primeira loja clicando no botão "Nova Loja".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLojas;
