
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ClipboardCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Audit Flow Compass</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome de usuário</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-4">
            Esqueceu sua senha? Entre em contato com um administrador.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
