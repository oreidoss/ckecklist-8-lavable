
import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserPlus, RefreshCw } from 'lucide-react';
import { Usuario } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';

interface AddUsuarioDialogProps {
  onAddUsuario: (usuario: Omit<Usuario, "id">) => Promise<void>;
  isLoading: boolean;
}

export const AddUsuarioDialog: React.FC<AddUsuarioDialogProps> = ({
  onAddUsuario,
  isLoading
}) => {
  const [novoUsuario, setNovoUsuario] = useState<Omit<Usuario, "id">>({ 
    nome: '', 
    email: '', 
    role: undefined, 
    senha: '' 
  });
  const { toast } = useToast();
  
  const validarEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const handleAdicionarClick = async (close: () => void) => {
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
    
    if (!novoUsuario.senha || novoUsuario.senha.length < 4) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    await onAddUsuario(novoUsuario);
    setNovoUsuario({ nome: '', email: '', role: undefined, senha: '' });
    close();
  };

  return (
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
              value={novoUsuario.senha || ''}
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
              onValueChange={(value) => {
                const role = value === 'none' ? undefined : 
                  (value as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined);
                setNovoUsuario({ ...novoUsuario, role });
              }}
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
            <Button onClick={(e) => {
              // Get the close function from DialogClose context
              const closeButton = e.currentTarget.closest('button');
              const closeEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0
              });
              
              // First handle our logic
              handleAdicionarClick(() => {
                // Then trigger the close action
                if (closeButton) {
                  closeButton.dispatchEvent(closeEvent);
                }
              });
            }} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Adicionar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
