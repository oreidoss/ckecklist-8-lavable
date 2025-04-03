
import { Usuario } from '../types';
import { BaseService } from './baseService';

export class UsuarioService extends BaseService {
  private readonly STORAGE_KEY = 'usuarios';

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
}

export const usuarioService = new UsuarioService();
