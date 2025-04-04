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
  SelectValue,
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
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/PageTitle";
import { usuarioService } from "@/lib/services/usuarioService";
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, User, UserPlus, ShieldCheck, RefreshCw } from 'lucide-react';
import { Usuario } from "@/lib/types";

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const [novoUsuario, setNovoUsuario] = useState({ 
    nome: '', 
    email: '', 
    role: '', 
    senha: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const carregarUsuarios = async () => {
    setIsLoading(true);
    try {
      const usuariosDB = await usuarioService.getUsuarios();
      setUsuarios(usuariosDB);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar os usuários. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    carregarUsuarios();
  }, []);
  
  const validarEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const handleAdicionarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome, email e senha do usuário.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validarEmail(novoUsuario.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um email válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (usuarios.some(usuario => usuario.email.toLowerCase() === novoUsuario.email.toLowerCase())) {
      toast({
        title: "Email duplicado",
        description: "Já existe um usuário com este email.",
        variant: "destructive"
      });
      return;
    }
    
    if (!novoUsuario.senha || novoUsuario.senha.length < 4) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const usuarioData = {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined,
        senha: novoUsuario.senha
      };
      
      const adicionado = await usuarioService.addUsuario(usuarioData);
      
      setUsuarios([...usuarios, adicionado]);
      setNovoUsuario({ nome: '', email: '', role: '', senha: '' });
      
      toast({
        title: "Usuário adicionado",
        description: `Usuário ${adicionado.nome} foi adicionado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({
        title: "Erro ao adicionar usuário",
        description: "Não foi possível adicionar o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAtualizarUsuario = async () => {
    if (!usuarioParaEditar) return;
    
    if (!usuarioParaEditar.nome || !usuarioParaEditar.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e o email do usuário.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validarEmail(usuarioParaEditar.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um email válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (usuarios.some(usuario => 
      usuario.email.toLowerCase() === usuarioParaEditar.email.toLowerCase() && 
      usuario.id !== usuarioParaEditar.id)
    ) {
      toast({
        title: "Email duplicado",
        description: "Já existe um usuário com este email.",
        variant: "destructive"
      });
      return;
    }
    
    if (usuarioParaEditar.senha && usuarioParaEditar.senha.length < 4) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await usuarioService.updateUsuario(usuarioParaEditar);
      
      setUsuarios(usuarios.map(usuario => 
        usuario.id === usuarioParaEditar.id ? usuarioParaEditar : usuario
      ));
      
      setUsuarioParaEditar(null);
      
      toast({
        title: "Usuário atualizado",
        description: `Usuário ${usuarioParaEditar.nome} foi atualizado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExcluirUsuario = async (id: string) => {
    try {
      setIsLoading(true);
      // Verificar se possui auditorias está removido por agora
      
      await usuarioService.deleteUsuario(id);
      setUsuarios(usuarios.filter(usuario => usuario.id !== id));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário. Verifique se não há auditorias associadas a ele.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleBadge = (role?: string) => {
    if (!role) return <span className="text-muted-foreground text-sm">Não definida</span>;
    
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="bg-purple-600">Administrador</Badge>;
      case 'gerente':
        return <Badge variant="default">Gerente</Badge>;
      case 'supervisor':
        return <Badge variant="secondary">Supervisora</Badge>;
      default:
        return <span className="text-muted-foreground text-sm">Não definida</span>;
    }
  };
  
  return (
    <div>
      <PageTitle 
        title="Gerenciamento de Usuários" 
        description="Adicione, edite e remova usuários do sistema"
      />
      
      <div className="flex justify-between items-center mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar um novo usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  className="col-span-3"
                  placeholder="João Silva"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  className="col-span-3"
                  placeholder="joao.silva@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="senha" className="text-right">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  className="col-span-3"
                  placeholder="********"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Função
                </Label>
                <Select 
                  value={novoUsuario.role} 
                  onValueChange={(value) => setNovoUsuario({ ...novoUsuario, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem função específica</SelectItem>
                    <SelectItem value="supervisor">Supervisora</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAdicionarUsuario} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Adicionar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" onClick={carregarUsuarios} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Atualizar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os usuários disponíveis para realizar auditorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : usuarios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {renderRoleBadge(usuario.role)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setUsuarioParaEditar(usuario)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Usuário</DialogTitle>
                              <DialogDescription>
                                Altere as informações do usuário conforme necessário.
                              </DialogDescription>
                            </DialogHeader>
                            {usuarioParaEditar && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-nome" className="text-right">
                                    Nome
                                  </Label>
                                  <Input
                                    id="edit-nome"
                                    value={usuarioParaEditar.nome}
                                    onChange={(e) => setUsuarioParaEditar({ 
                                      ...usuarioParaEditar, 
                                      nome: e.target.value 
                                    })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-email" className="text-right">
                                    Email
                                  </Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={usuarioParaEditar.email}
                                    onChange={(e) => setUsuarioParaEditar({ 
                                      ...usuarioParaEditar, 
                                      email: e.target.value 
                                    })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-senha" className="text-right">
                                    Senha
                                  </Label>
                                  <Input
                                    id="edit-senha"
                                    type="password"
                                    value={usuarioParaEditar.senha || ''}
                                    onChange={(e) => setUsuarioParaEditar({ 
                                      ...usuarioParaEditar, 
                                      senha: e.target.value 
                                    })}
                                    className="col-span-3"
                                    placeholder="Deixe em branco para manter a senha atual"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-role" className="text-right">
                                    Função
                                  </Label>
                                  <Select 
                                    value={usuarioParaEditar.role || 'none'} 
                                    onValueChange={(value) => setUsuarioParaEditar({ 
                                      ...usuarioParaEditar, 
                                      role: value === 'none' ? '' : value 
                                    })}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Selecione uma função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Sem função específica</SelectItem>
                                      <SelectItem value="supervisor">Supervisora</SelectItem>
                                      <SelectItem value="gerente">Gerente</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={handleAtualizarUsuario} disabled={isLoading}>
                                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                                  Salvar Alterações
                                </Button>
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
                              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário "{usuario.nome}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleExcluirUsuario(usuario.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isLoading}
                              >
                                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
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
              <User className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum usuário cadastrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione seu primeiro usuário clicando no botão "Novo Usuário".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsuarios;
