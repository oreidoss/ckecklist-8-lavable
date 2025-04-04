import { Usuario } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';
  private readonly AUTH_KEY = 'currentUser';

  async getUsuarios(): Promise<Usuario[]> {
    try {
      // Try to fetch users from Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) {
        console.error("Error fetching users from Supabase:", error);
        // Fallback to localStorage if there's an error
        return this.getItem<Usuario>(this.STORAGE_KEY);
      }
      
      // Map Supabase 'funcao' to 'role' for client-side compatibility
      const usuarios = data.map(user => ({
        ...user,
        role: user.funcao as 'admin' | 'user' | 'supervisor' | 'gerente' | undefined
      }));
      
      console.log("Successfully retrieved users from Supabase:", usuarios);
      return usuarios as Usuario[];
    } catch (e) {
      console.error("Error fetching users:", e);
      // Fallback to localStorage
      return this.getItem<Usuario>(this.STORAGE_KEY);
    }
  }

  async addUsuario(usuario: Omit<Usuario, "id">): Promise<Usuario> {
    try {
      console.log("Attempting to add user to Supabase:", usuario);
      
      // Add user to Supabase - map 'role' to 'funcao' for database
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
          funcao: usuario.role // Map role to the funcao field in Supabase
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error adding user to Supabase:", error);
        throw error;
      }
      
      // Ensure the returned user has the role property set from the funcao field
      const newUser = {
        ...data,
        role: data.funcao
      } as Usuario;
      
      console.log("User successfully added to Supabase:", newUser);
      return newUser;
    } catch (e) {
      console.error("Error adding user, using localStorage fallback:", e);
      // Fallback to localStorage in case of error
      const users = this.getItem<Usuario>(this.STORAGE_KEY);
      const id = this.getMaxId(users).toString(); // Convert to string
      const newUser = { ...usuario, id } as Usuario;
      this.setItem(this.STORAGE_KEY, [...users, newUser]);
      return newUser;
    }
  }

  async updateUsuario(usuario: Usuario): Promise<void> {
    try {
      console.log("Updating user in Supabase:", usuario);
      
      // Map role to funcao for the database update
      const updateData = {
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.role // This is the key change - save role as funcao
      };
      
      // Only include senha if it's provided
      if (usuario.senha) {
        (updateData as any).senha = usuario.senha;
      }
      
      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuario.id);
      
      if (error) {
        console.error("Error updating user in Supabase:", error);
        throw error;
      }
      
      console.log("User updated successfully in Supabase:", usuario);
      
      // Update current user in localStorage if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === usuario.id) {
        const updatedUser = { ...currentUser, ...usuario };
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Error updating user, using fallback localStorage:", e);
      // Fallback to localStorage
      const users = this.getItem<Usuario>(this.STORAGE_KEY);
      const index = users.findIndex(u => u.id === usuario.id);
      if (index >= 0) {
        users[index] = usuario;
        this.setItem(this.STORAGE_KEY, users);
      }
    }
  }

  async deleteUsuario(id: string): Promise<void> {
    try {
      // Deleta usuário no Supabase
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting user from Supabase:", error);
        throw error;
      }
      
      console.log("User deleted successfully from Supabase, ID:", id);
    } catch (e) {
      console.error("Error deleting user, using fallback localStorage:", e);
      // Fallback to localStorage
      const users = this.getItem<Usuario>(this.STORAGE_KEY).filter(u => u.id !== id);
      this.setItem(this.STORAGE_KEY, users);
    }
  }

  isAdmin(id: string): boolean {
    const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
    const usuario = usuarios.find(u => u.id === id);
    return usuario?.role === 'admin';
  }

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
}

export const usuarioService = new UsuarioService();
