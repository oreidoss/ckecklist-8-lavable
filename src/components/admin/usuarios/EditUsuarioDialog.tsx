
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
import { Edit, RefreshCw } from 'lucide-react';
import { Usuario } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';

interface EditUsuarioDialogProps {
  usuario: Usuario;
  onUpdateUsuario: (usuario: Usuario) => Promise<void>;
  isLoading: boolean;
}

export const EditUsuarioDialog: React.FC<EditUsuarioDialogProps> = ({
  usuario,
  onUpdateUsuario,
  isLoading
}) => {
  const [usuarioEditado, setUsuarioEditado] = useState<Usuario>({ ...usuario });
  const { toast } = useToast();
  
  const validarEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const handleSalvarClick = async (close: () => void) => {
    if (!usuarioEditado.nome || !usuarioEditado.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e o email do usuário.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validarEmail(usuarioEditado.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um email válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (usuarioEditado.senha && usuarioEditado.senha.length < 4) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    await onUpdateUsuario(usuarioEditado);
    close();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setUsuarioEditado({ ...usuario })}
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-nome" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-nome"
              value={usuarioEditado.nome}
              onChange={(e) => setUsuarioEditado({ 
                ...usuarioEditado, 
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
              value={usuarioEditado.email}
              onChange={(e) => setUsuarioEditado({ 
                ...usuarioEditado, 
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
              value={usuarioEditado.senha || ''}
              onChange={(e) => setUsuarioEditado({ 
                ...usuarioEditado, 
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
              value={usuarioEditado.role || 'none'} 
              onValueChange={(value) => {
                const role = value === 'none' ? undefined : 
                  (value as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined);
                setUsuarioEditado({
                  ...usuarioEditado, 
                  role
                });
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
          <DialogClose>
            {(close) => (
              <Button onClick={() => handleSalvarClick(close)} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Salvar Alterações
              </Button>
            )}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
