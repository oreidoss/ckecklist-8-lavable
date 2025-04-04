
import { Usuario } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';
  private readonly AUTH_KEY = 'currentUser';

  async getUsuarios(): Promise<Usuario[]> {
    try {
      // Tenta buscar usuários do Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) {
        console.error("Erro ao buscar usuários do Supabase:", error);
        // Fallback para localStorage se houver erro
        return this.getItem<Usuario>(this.STORAGE_KEY);
      }
      
      return data as Usuario[];
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
      // Fallback para localStorage
      return this.getItem<Usuario>(this.STORAGE_KEY);
    }
  }

  async addUsuario(usuario: Omit<Usuario, "id">): Promise<Usuario> {
    try {
      // Adiciona usuário no Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert([usuario])
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao adicionar usuário no Supabase:", error);
        throw error;
      }
      
      const novoUsuario = data as Usuario;
      
      console.log("Usuário adicionado com sucesso no Supabase:", novoUsuario);
      return novoUsuario;
    } catch (e) {
      console.error("Erro ao adicionar usuário, usando fallback localStorage:", e);
      // Fallback para o localStorage em caso de erro
      const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
      const id = this.getMaxId(usuarios).toString(); // Convert to string
      const novoUsuario = { ...usuario, id } as Usuario;
      this.setItem(this.STORAGE_KEY, [...usuarios, novoUsuario]);
      return novoUsuario;
    }
  }

  async updateUsuario(usuario: Usuario): Promise<void> {
    try {
      // Atualiza usuário no Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
          role: usuario.role
        })
        .eq('id', usuario.id);
      
      if (error) {
        console.error("Erro ao atualizar usuário no Supabase:", error);
        throw error;
      }
      
      console.log("Usuário atualizado com sucesso no Supabase:", usuario);
    } catch (e) {
      console.error("Erro ao atualizar usuário, usando fallback localStorage:", e);
      // Fallback para o localStorage em caso de erro
      const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
      const index = usuarios.findIndex(u => u.id === usuario.id);
      if (index >= 0) {
        usuarios[index] = usuario;
        this.setItem(this.STORAGE_KEY, usuarios);
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
        console.error("Erro ao deletar usuário no Supabase:", error);
        throw error;
      }
      
      console.log("Usuário deletado com sucesso no Supabase, ID:", id);
    } catch (e) {
      console.error("Erro ao deletar usuário, usando fallback localStorage:", e);
      // Fallback para o localStorage em caso de erro
      const usuarios = this.getItem<Usuario>(this.STORAGE_KEY).filter(u => u.id !== id);
      this.setItem(this.STORAGE_KEY, usuarios);
    }
  }
  
  isAdmin(id: string): boolean {
    const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
    const usuario = usuarios.find(u => u.id === id);
    return usuario?.role === 'admin';
  }

  async login(loginId: string, senha: string): Promise<Usuario | null> {
    try {
      // Busca usuário no Supabase pelo nome ou email
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`nome.ilike.${loginId},email.ilike.${loginId}`);
      
      if (error) {
        console.error("Erro ao buscar usuário para login do Supabase:", error);
        throw error;
      }
      
      console.log("Resultado da busca por usuário:", data);
      
      // Verifica se encontrou algum usuário
      if (!data || data.length === 0) {
        console.log("Usuário não encontrado no Supabase");
        return null;
      }
      
      // Encontra o usuário com credenciais corretas
      const usuario = data.find(u => u.senha === senha);
      
      if (!usuario) {
        console.log("Senha incorreta");
        return null;
      }
      
      const usuarioConvertido = usuario as Usuario;
      
      // Remove a senha antes de armazenar no localStorage
      const { senha: _, ...userWithoutSenha } = usuarioConvertido;
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutSenha));
      
      console.log("Login bem-sucedido:", usuarioConvertido.nome);
      return usuarioConvertido;
    } catch (e) {
      console.error("Erro no login, tentando fallback localStorage:", e);
      
      // Fallback para localStorage
      const usuarios = this.getItem<Usuario>(this.STORAGE_KEY);
      console.log("Tentando login via localStorage para:", loginId);
      console.log("Usuários disponíveis:", usuarios.length);
      
      // Tenta encontrar usuário por nome ou email
      const usuario = usuarios.find(
        u => u.nome.toLowerCase() === loginId.toLowerCase() || 
             (u.email && u.email.toLowerCase() === loginId.toLowerCase())
      );
      
      if (!usuario) {
        console.log("Usuário não encontrado");
        return null;
      }
      
      // Verifica a senha
      if (usuario.senha === senha) {
        console.log("Senha correta, login bem-sucedido");
        // Remove a senha antes de armazenar no localStorage
        const { senha: _, ...userWithoutSenha } = usuario;
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutSenha));
        return usuario;
      }
      
      console.log("Senha incorreta");
      return null;
    }
  }

  // Get current authenticated user
  getCurrentUser(): Usuario | null {
    const userJson = localStorage.getItem(this.AUTH_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Logout method
  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  // Método para verificar credenciais sem login
  async verificarCredenciais(loginId: string, senha: string): Promise<boolean> {
    try {
      // Busca usuário no Supabase pelo nome ou email
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`nome.ilike.${loginId},email.ilike.${loginId}`);
      
      if (error) {
        console.error("Erro ao verificar credenciais no Supabase:", error);
        throw error;
      }
      
      // Verifica se encontrou algum usuário com a senha correta
      return data && data.some(u => u.senha === senha);
    } catch (e) {
      console.error("Erro ao verificar credenciais, usando fallback localStorage:", e);
      
      // Fallback para localStorage
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
