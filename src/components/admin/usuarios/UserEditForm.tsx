
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Usuario } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';

interface UserEditFormProps {
  usuario: Usuario;
  onUsuarioChange: (usuario: Usuario) => void;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({
  usuario,
  onUsuarioChange
}) => {
  const { toast } = useToast();
  
  const validarEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleChange = (field: keyof Usuario, value: string) => {
    if (field === 'email' && value && !validarEmail(value)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um email válido.",
        variant: "destructive"
      });
    }
    
    if (field === 'senha' && value && value.length < 4) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive"
      });
    }
    
    onUsuarioChange({ 
      ...usuario, 
      [field]: value 
    });
  };

  const handleRoleChange = (value: string) => {
    console.log("Nova função selecionada:", value);
    const role = value === 'none' ? undefined : 
      (value as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined);
    
    onUsuarioChange({
      ...usuario, 
      role
    });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-nome" className="text-right">
          Nome
        </Label>
        <Input
          id="edit-nome"
          value={usuario.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
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
          value={usuario.email}
          onChange={(e) => handleChange('email', e.target.value)}
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
          value={usuario.senha || ''}
          onChange={(e) => handleChange('senha', e.target.value)}
          className="col-span-3"
          placeholder="Deixe em branco para manter a senha atual"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="edit-role" className="text-right">
          Função
        </Label>
        <Select 
          value={usuario.role || 'none'} 
          onValueChange={handleRoleChange}
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
  );
};
