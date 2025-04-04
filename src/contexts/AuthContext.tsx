
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Usuario } from '@/lib/types';
import { usuarioService } from '@/lib/services/usuarioService';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: Usuario | null;
  isAdmin: boolean;
  login: (nome: string, senha: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for current user on app initialization
    const currentUser = usuarioService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');
    } else {
      // Only navigate to login if not already there
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [navigate]);

  const login = async (nome: string, senha: string): Promise<boolean> => {
    try {
      console.log("AuthContext attempting login with:", nome);
      const loggedInUser = await usuarioService.login(nome, senha);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        setIsAdmin(loggedInUser.role === 'admin');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    usuarioService.logout();
    setUser(null);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
