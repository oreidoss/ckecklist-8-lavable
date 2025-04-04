
import { Usuario } from '../types';
import { BaseService } from './baseService';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';
  private readonly AUTH_KEY = 'currentUser';

  getUsuarios(): Usuario[] {
    const usuarios = this.getItem<Usuario[]>(this.STORAGE_KEY) || [];
    return usuarios;
  }

  addUsuario(usuario: Omit<Usuario, "id">): Usuario {
    const usuarios = this.getUsuarios();
    const id = this.getMaxId(usuarios);
    const novoUsuario = { ...usuario, id };
    
    // Debug info for user creation
    console.log("Adicionando novo usuário:", novoUsuario);
    
    this.setItem(this.STORAGE_KEY, [...usuarios, novoUsuario]);
    
    // Verify if the user was saved correctly
    const usuariosAtualizados = this.getUsuarios();
    console.log("Lista de usuários após adicionar:", usuariosAtualizados);
    
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

  login(loginId: string, senha: string): Usuario | null {
    const usuarios = this.getUsuarios();
    
    // Debug info for troubleshooting
    console.log("Tentando login para: ", loginId);
    console.log("Usuários disponíveis: ", usuarios.length);
    console.log("Lista de usuários:", JSON.stringify(usuarios));
    
    // Try to find user by name or email (case insensitive)
    const usuario = usuarios.find(
      u => u.nome.toLowerCase() === loginId.toLowerCase() || 
           (u.email && u.email.toLowerCase() === loginId.toLowerCase())
    );
    
    if (!usuario) {
      console.log("Usuário não encontrado");
      return null;
    }
    
    console.log("Usuário encontrado:", usuario.nome, "verificando senha");
    // Then check if the password matches exactly
    if (usuario.senha === senha) {
      console.log("Senha correta, login bem-sucedido");
      // Remove the password before storing in localStorage
      const { senha: _, ...userWithoutSenha } = usuario;
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(userWithoutSenha));
      return usuario;
    }
    
    console.log("Senha incorreta, fornecida:", senha, "esperada:", usuario.senha);
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
  verificarCredenciais(loginId: string, senha: string): boolean {
    const usuarios = this.getUsuarios();
    return usuarios.some(
      u => (u.nome.toLowerCase() === loginId.toLowerCase() || 
            (u.email && u.email.toLowerCase() === loginId.toLowerCase())) && 
           u.senha === senha
    );
  }
}

export const usuarioService = new UsuarioService();
