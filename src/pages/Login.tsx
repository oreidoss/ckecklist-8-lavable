
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usuarioService } from "@/lib/services/usuarioService";
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterDialog } from '@/components/auth/RegisterDialog';
import { LoginHelp } from '@/components/auth/LoginHelp';
import { LoginLogo } from '@/components/auth/LoginLogo';

const Login = () => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = usuarioService.getCurrentUser();
    if (currentUser) {
      navigate('/');
    }
    
    // Debug users on mount
    const checkUsers = async () => {
      const usuarios = await usuarioService.getUsuarios();
      console.log("Usuários disponíveis ao carregar página de login:", usuarios);
    };
    
    checkUsers();
  }, [navigate]);

  // Handler for when registration is successful
  const handleRegisterSuccess = (newNome: string, newSenha: string) => {
    setNome(newNome);
    setSenha(newSenha);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <LoginLogo />
          <CardTitle className="text-xl sm:text-2xl">Checklist 9.0</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?
            </p>
            <RegisterDialog onRegisterSuccess={handleRegisterSuccess} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-2 sm:mt-4">
            Esqueceu sua senha? Entre em contato com um administrador.
          </p>
          <LoginHelp />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
