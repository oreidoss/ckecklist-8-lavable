import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: Usuario | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithPassword: (email: string, senha: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (nome: string, email: string, senha: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback(async (authUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .or(`user_id.eq.${authUser.id},email.eq.${authUser.email}`)
        .limit(1)
        .maybeSingle();

      const { data: roles } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', authUser.id);

      const adminByRole = Array.isArray(roles) && roles.some((r: any) => r.role === 'admin');
      const adminByFuncao = profile?.funcao === 'admin';

      setIsAdmin(adminByRole || adminByFuncao);
      setUser({
        id: profile?.id ?? authUser.id,
        nome:
          profile?.nome ??
          (authUser.user_metadata?.nome as string) ??
          (authUser.user_metadata?.full_name as string) ??
          authUser.email?.split('@')[0] ??
          'Usuário',
        email: profile?.email ?? authUser.email ?? '',
        funcao: profile?.funcao ?? undefined,
        role: (profile?.funcao as Usuario['role']) ?? (adminByRole ? 'admin' : 'user'),
      });
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setUser({
        id: authUser.id,
        nome: authUser.email?.split('@')[0] ?? 'Usuário',
        email: authUser.email ?? '',
        role: 'user',
      });
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // defer supabase calls out of the callback
        setTimeout(() => loadProfile(newSession.user), 0);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        loadProfile(existing.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithPassword = async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    return { error: error?.message ?? null };
  };

  const signUpWithPassword = async (nome: string, email: string, senha: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome },
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Erro ao sair', description: error.message, variant: 'destructive' });
    }
    setUser(null);
    setIsAdmin(false);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, logout }}
    >
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
