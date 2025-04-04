
import { Usuario } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';

export class AuthService extends BaseService {
  private readonly AUTH_KEY = 'currentUser';
  private readonly STORAGE_KEY = 'usuarios';

  async login(loginId: string, senha: string): Promise<Usuario | null> {
    try {
      console.log("Attempting login with:", loginId);
      
      // Search for user in Supabase by name or email
      let { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`nome.eq.${loginId},email.eq.${loginId}`);
      
      if (error) {
        console.error("Error fetching user for login from Supabase:", error);
        throw error;
      }
      
      console.log("Login search results:", data);
      
      // Check if any user was found
      if (!data || data.length === 0) {
        // Try direct query for exact matching
        const { data: exactData, error: exactError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('nome', loginId);
          
        if (exactError || !exactData || exactData.length === 0) {
          console.log("User not found in Supabase");
          // Try localStorage fallback
          return this.loginWithLocalStorage(loginId, senha);
        }
        
        console.log("Found user by exact name match:", exactData);
        data = exactData;
      }
      
      // Find user with correct credentials
      const user = data.find(u => u.senha === senha);
      
      if (!user) {
        console.log("Incorrect password");
        // Try localStorage fallback
        return this.loginWithLocalStorage(loginId, senha);
      }
      
      // Map the Supabase 'funcao' field to the 'role' property used client-side
      const convertedUser = {
        ...user,
        role: user.funcao as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined
      } as Usuario;
      
      // Remove password before storing in localStorage
      const { senha: _, ...userWithoutPassword } = convertedUser;
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutPassword));
      
      console.log("Successful login:", convertedUser.nome, "role:", convertedUser.role);
      return convertedUser;
    } catch (e) {
      console.error("Login error, trying localStorage fallback:", e);
      return this.loginWithLocalStorage(loginId, senha);
    }
  }
  
  private async loginWithLocalStorage(loginId: string, senha: string): Promise<Usuario | null> {
    // Fallback to localStorage
    const users = this.getItem<Usuario>(this.STORAGE_KEY);
    console.log("Trying login via localStorage for:", loginId);
    console.log("Available users:", users.length);
    
    // Try to find user by name or email
    const user = users.find(
      u => u.nome.toLowerCase() === loginId.toLowerCase() || 
            (u.email && u.email.toLowerCase() === loginId.toLowerCase())
    );
    
    if (!user) {
      console.log("User not found");
      return null;
    }
    
    // Verify password
    if (user.senha === senha) {
      console.log("Correct password, login successful");
      // Remove password before storing in localStorage
      const { senha: _, ...userWithoutPassword } = user;
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutPassword));
      return user;
    }
    
    console.log("Incorrect password");
    return null;
  }

  getCurrentUser(): Usuario | null {
    const userJson = localStorage.getItem(this.AUTH_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  async verificarCredenciais(loginId: string, senha: string): Promise<boolean> {
    try {
      // Search user in Supabase by name or email
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`nome.ilike.${loginId},email.ilike.${loginId}`);
      
      if (error) {
        console.error("Error verifying credentials from Supabase:", error);
        throw error;
      }
      
      // Check if found any user with the correct password
      return data && data.some(u => u.senha === senha);
    } catch (e) {
      console.error("Error verifying credentials, using fallback localStorage:", e);
      
      // Fallback to localStorage
      const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
      return usuarios.some(
        u => (u.nome.toLowerCase() === loginId.toLowerCase() || 
              (u.email && u.email.toLowerCase() === loginId.toLowerCase())) && 
             u.senha === senha
      );
    }
  }

  isAdmin(id: string): boolean {
    const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
    const usuario = usuarios.find(u => u.id === id);
    return usuario?.role === 'admin';
  }
}

export const authService = new AuthService();
