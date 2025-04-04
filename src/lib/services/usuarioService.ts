
import { Usuario } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';
import { authService } from './authService';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';

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
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === usuario.id) {
        const updatedUser = { ...currentUser, ...usuario };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
  
  // Re-export authService methods to maintain backward compatibility
  login = authService.login.bind(authService);
  logout = authService.logout.bind(authService);
  getCurrentUser = authService.getCurrentUser.bind(authService);
  verificarCredenciais = authService.verificarCredenciais.bind(authService);
  isAdmin = authService.isAdmin.bind(authService);
}

export const usuarioService = new UsuarioService();
