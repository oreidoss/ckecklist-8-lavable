
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usuarioService } from "@/lib/services/usuarioService";
import { 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";

interface RegisterFormProps {
  onSuccess: (nome: string, senha: string) => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [registering, setRegistering] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    
    // Simple validation
    if (!newNome || !newEmail || !newSenha) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para o cadastro",
        variant: "destructive"
      });
      setRegistering(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido",
        variant: "destructive"
      });
      setRegistering(false);
      return;
    }
    
    try {
      // Check if user already exists
      const usuarios = await usuarioService.getUsuarios();
      
      if (usuarios) {
        const userExists = usuarios.some(u => 
          u.nome.toLowerCase() === newNome.toLowerCase() || 
          (u.email && u.email.toLowerCase() === newEmail.toLowerCase())
        );
        
        if (userExists) {
          toast({
            title: "Usuário já existe",
            description: "Este nome de usuário ou email já está em uso",
            variant: "destructive"
          });
          setRegistering(false);
          return;
        }
      }
      
      console.log("Registrando novo usuário:", newNome, newEmail);
      
      // Add new user
      const newUser = await usuarioService.addUsuario({
        nome: newNome,
        email: newEmail,
        senha: newSenha,
        role: 'user' // Default role
      });
      
      if (newUser) {
        toast({
          title: "Cadastro bem-sucedido",
          description: "Você já pode fazer login com suas credenciais"
        });
        
        // Automatically fill login form with new credentials
        onSuccess(newNome, newSenha);
        
        setNewNome('');
        setNewEmail('');
        setNewSenha('');
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível completar o cadastro",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro durante o cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao tentar cadastrar",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="new-nome">Nome de usuário</Label>
        <Input
          id="new-nome"
          value={newNome}
          onChange={(e) => setNewNome(e.target.value)}
          placeholder="Seu nome de usuário"
          disabled={registering}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-email">Email</Label>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="seu-email@exemplo.com"
          disabled={registering}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-senha">Senha</Label>
        <Input
          id="new-senha"
          type="password"
          value={newSenha}
          onChange={(e) => setNewSenha(e.target.value)}
          placeholder="Escolha uma senha segura"
          disabled={registering}
        />
      </div>
      
      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={registering}
        >
          {registering ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
};
