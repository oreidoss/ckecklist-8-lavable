import { Usuario } from '../types';
import { BaseService } from './baseService';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';
  private readonly AUTH_KEY = 'currentUser';

  getUsuarios(): Usuario[] {
    return this.getItem<Usuario>(this.STORAGE_KEY);
  }

  addUsuario(usuario: Omit<Usuario, "id">): Usuario {
    const usuarios = this.getUsuarios();
    const id = this.getMaxId(usuarios);
    const novoUsuario = { ...usuario, id };
    this.setItem(this.STORAGE_KEY, [...usuarios, novoUsuario]);
    return novoUsuario;
  }

  updateUsuario(usuario: Usuario): void {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    if (index >= 0) {
      usuarios[index] = usuario;
      this.setItem(this.STORAGE_KEY, usuarios);
    }
  }

  deleteUsuario(id: number): void {
    const usuarios = this.getUsuarios().filter(u => u.id !== id);
    this.setItem(this.STORAGE_KEY, usuarios);
  }
  
  isAdmin(id: number): boolean {
    const usuario = this.getUsuarios().find(u => u.id === id);
    return usuario?.role === 'admin';
  }

  login(nome: string, senha: string): Usuario | null {
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.nome === nome && u.senha === senha);
    
    if (usuario) {
      // Remover a senha antes de armazenar no localStorage
      const { senha: _, ...userWithoutSenha } = usuario;
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutSenha));
      return usuario;
    }
    
    return null;
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
  verificarCredenciais(nome: string, senha: string): boolean {
    const usuarios = this.getUsuarios();
    return usuarios.some(u => u.nome === nome && u.senha === senha);
  }
}

export const usuarioService = new UsuarioService();
