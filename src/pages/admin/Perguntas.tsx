
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { db, Pergunta, Secao } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';
import { Edit, HelpCircle, Plus, Trash2 } from 'lucide-react';

const AdminPerguntas: React.FC = () => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [perguntaParaEditar, setPerguntaParaEditar] = useState<Pergunta | null>(null);
  const [novaPergunta, setNovaPergunta] = useState({ secao_id: '', texto: '' });
  const { toast } = useToast();
  
  useEffect(() => {
    // Carregar perguntas e seções do banco de dados
    setPerguntas(db.getPerguntas());
    setSecoes(db.getSecoes());
  }, []);
  
  const handleAdicionarPergunta = () => {
    if (!novaPergunta.secao_id || !novaPergunta.texto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a seção e o texto da pergunta.",
        variant: "destructive"
      });
      return;
    }
    
    const adicionada = db.addPergunta({
      secao_id: novaPergunta.secao_id,
      texto: novaPergunta.texto
    });
    
    setPerguntas([...perguntas, adicionada]);
    setNovaPergunta({ secao_id: '', texto: '' });
    
    toast({
      title: "Pergunta adicionada",
      description: "A pergunta foi adicionada com sucesso."
    });
  };
  
  const handleAtualizarPergunta = () => {
    if (!perguntaParaEditar) return;
    
    if (!perguntaParaEditar.secao_id || !perguntaParaEditar.texto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a seção e o texto da pergunta.",
        variant: "destructive"
      });
      return;
    }
    
    db.updatePergunta(perguntaParaEditar);
    setPerguntas(perguntas.map(pergunta => 
      pergunta.id === perguntaParaEditar.id ? perguntaParaEditar : pergunta
    ));
    setPerguntaParaEditar(null);
    
    toast({
      title: "Pergunta atualizada",
      description: "A pergunta foi atualizada com sucesso."
    });
  };
  
  const handleExcluirPergunta = (id: string) => {
    // Verificar se há respostas associadas a esta pergunta
    const respostas = db.getRespostas();
    const temRespostas = respostas.some(resposta => resposta.pergunta_id === id);
    
    if (temRespostas) {
      toast({
        title: "Não é possível excluir",
        description: "Esta pergunta possui respostas associadas em auditorias. Exclua as auditorias primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    db.deletePergunta(id);
    setPerguntas(perguntas.filter(pergunta => pergunta.id !== id));
    
    toast({
      title: "Pergunta excluída",
      description: "A pergunta foi excluída com sucesso."
    });
  };
  
  const getSecaoNome = (secaoId: string) => {
    const secao = secoes.find(s => s.id === secaoId);
    return secao ? secao.nome : 'Seção não encontrada';
  };
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Perguntas" 
        description="Adicione, edite e remova perguntas do checklist"
      />
      
      <div className="flex justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova pergunta.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secao" className="text-right">
                  Seção
                </Label>
                <Select 
                  value={novaPergunta.secao_id} 
                  onValueChange={(value) => setNovaPergunta({ ...novaPergunta, secao_id: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {secoes.map((secao) => (
                      <SelectItem key={secao.id} value={secao.id.toString()}>
                        {secao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="texto" className="text-right">
                  Pergunta
                </Label>
                <div className="col-span-3">
                  <Input
                    id="texto"
                    value={novaPergunta.texto}
                    onChange={(e) => setNovaPergunta({ ...novaPergunta, texto: e.target.value })}
                    placeholder="A loja está limpa e sem poeira?"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAdicionarPergunta}>Adicionar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as perguntas disponíveis para o checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {perguntas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Seção</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perguntas.map((pergunta) => (
                  <TableRow key={pergunta.id}>
                    <TableCell>{getSecaoNome(pergunta.secao_id)}</TableCell>
                    <TableCell>{pergunta.texto}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setPerguntaParaEditar(pergunta)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Pergunta</DialogTitle>
                              <DialogDescription>
                                Altere as informações da pergunta conforme necessário.
                              </DialogDescription>
                            </DialogHeader>
                            {perguntaParaEditar && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-secao" className="text-right">
                                    Seção
                                  </Label>
                                  <Select 
                                    value={perguntaParaEditar.secao_id.toString()} 
                                    onValueChange={(value) => setPerguntaParaEditar({ 
                                      ...perguntaParaEditar, 
                                      secao_id: parseInt(value) 
                                    })}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Selecione uma seção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {secoes.map((secao) => (
                                        <SelectItem key={secao.id} value={secao.id.toString()}>
                                          {secao.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-texto" className="text-right">
                                    Pergunta
                                  </Label>
                                  <div className="col-span-3">
                                    <Input
                                      id="edit-texto"
                                      value={perguntaParaEditar.texto}
                                      onChange={(e) => setPerguntaParaEditar({ 
                                        ...perguntaParaEditar, 
                                        texto: e.target.value 
                                      })}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={handleAtualizarPergunta}>Salvar Alterações</Button>
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
                              <AlertDialogTitle>Excluir Pergunta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta pergunta? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleExcluirPergunta(pergunta.id)}
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
              <HelpCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma pergunta cadastrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione sua primeira pergunta clicando no botão "Nova Pergunta".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerguntas;
