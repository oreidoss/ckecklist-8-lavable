
import { Secao } from '../types';
import { BaseService } from './baseService';

export class SecaoService extends BaseService {
  private readonly STORAGE_KEY = 'secoes';

  getSecoes(): Secao[] {
    return this.getItem<Secao>(this.STORAGE_KEY);
  }

  addSecao(secao: Omit<Secao, "id">): Secao {
    const secoes = this.getSecoes();
    const id = this.getMaxId(secoes);
    const novaSecao = { ...secao, id };
    this.setItem(this.STORAGE_KEY, [...secoes, novaSecao]);
    return novaSecao;
  }

  updateSecao(secao: Secao): void {
    const secoes = this.getSecoes();
    const index = secoes.findIndex(s => s.id === secao.id);
    if (index >= 0) {
      secoes[index] = secao;
      this.setItem(this.STORAGE_KEY, secoes);
    }
  }

  deleteSecao(id: string): void {
    const secoes = this.getSecoes().filter(s => s.id !== id);
    this.setItem(this.STORAGE_KEY, secoes);
  }
}

export const secaoService = new SecaoService();
