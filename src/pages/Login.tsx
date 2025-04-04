
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usuarioService } from "@/lib/services/usuarioService";
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

const Login = () => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  // For registration
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSenha, setNewSenha] = useState('');
  const [registering, setRegistering] = useState(false);
  
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

  const handleRegister = (e: React.FormEvent) => {
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
    
    // Check if user already exists
    const usuarios = usuarioService.getUsuarios();
    if (usuarios.some(u => u.nome.toLowerCase() === newNome.toLowerCase() || 
                          (u.email && u.email.toLowerCase() === newEmail.toLowerCase()))) {
      toast({
        title: "Usuário já existe",
        description: "Este nome de usuário ou email já está em uso",
        variant: "destructive"
      });
      setRegistering(false);
      return;
    }
    
    console.log("Registrando novo usuário:", newNome, newEmail);
    
    // Add new user
    const newUser = usuarioService.addUsuario({
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
      setNome(newNome);
      setSenha(newSenha);
      
      setNewNome('');
      setNewEmail('');
      setNewSenha('');
      setRegistering(false);
    } else {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível completar o cadastro",
        variant: "destructive"
      });
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 sm:mb-4">
            <img 
              src="/lovable-uploads/1a7a1eb0-0f52-443d-8508-441a6cca0dce.png" 
              alt="Checklist 9.0 Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Checklist 9.0</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-2">
                  Cadastrar-se
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar nova conta</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo para se cadastrar no sistema.
                  </DialogDescription>
                </DialogHeader>
                
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
              </DialogContent>
            </Dialog>
          </div>
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
