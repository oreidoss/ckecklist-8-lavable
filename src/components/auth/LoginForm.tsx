
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usuarioService } from "@/lib/services/usuarioService";

export const LoginForm = () => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!nome || !senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    console.log(`Attempting login with: name="${nome}", password="${senha}"`);
    
    try {
      // Debug available users in the system
      const usuarios = await usuarioService.getUsuarios();
      console.log("Available users in the system:", usuarios);
      
      // Try to login
      const user = await usuarioService.login(nome, senha);
      
      if (user) {
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${user.nome}!`
        });
        navigate('/');
      } else {
        toast({
          title: "Falha no login",
          description: "Nome de usuário ou senha incorretos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome de usuário ou Email</Label>
        <Input
          id="nome"
          type="text"
          placeholder="Seu nome de usuário ou email"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={loading}
          className="h-10 sm:h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
          className="h-10 sm:h-11"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 mt-2" 
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
