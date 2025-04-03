
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usuarioService } from "@/lib/services/usuarioService";
import { ClipboardCheck } from "lucide-react";

const Login = () => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = usuarioService.getCurrentUser();
    if (currentUser) {
      navigate('/');
    }
    
    // Debug users on mount
    const usuarios = usuarioService.getUsuarios();
    console.log("Usuários disponíveis ao carregar página de login:", usuarios);
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
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

    console.log(`Tentando login com: nome="${nome}", senha="${senha}"`);
    
    // Let's debug the current users in the system
    const usuarios = usuarioService.getUsuarios();
    console.log("Usuários disponíveis no sistema:", usuarios);
    
    // Try to login
    const user = usuarioService.login(nome, senha);
    
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 sm:mb-4">
            <ClipboardCheck className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Audit Flow Compass</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome de usuário</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome de usuário"
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
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-2 sm:mt-4">
            Esqueceu sua senha? Entre em contato com um administrador.
          </p>
          <div className="mt-4 text-xs text-center text-muted-foreground">
            <p>Usuário de teste: <strong>testeuser</strong></p>
            <p>Senha de teste: <strong>Teste123!</strong></p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
