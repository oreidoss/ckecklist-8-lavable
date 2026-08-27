import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginHelp } from '@/components/auth/LoginHelp';
import { LoginLogo } from '@/components/auth/LoginLogo';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <LoginLogo />
          <CardTitle className="text-xl sm:text-2xl">Checklist 9.0</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-2 sm:mt-4">
            Problemas para acessar? Entre em contato com um administrador.
          </p>
          <LoginHelp />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
