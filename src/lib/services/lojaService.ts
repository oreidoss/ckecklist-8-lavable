
import { Loja } from '../types';
import { BaseService } from './baseService';

export class LojaService extends BaseService {
  private readonly STORAGE_KEY = 'lojas';

  getLojas(): Loja[] {
    return this.getItem<Loja>(this.STORAGE_KEY);
  }

  addLoja(loja: Omit<Loja, "id">): Loja {
    const lojas = this.getLojas();
    const id = this.getMaxId(lojas);
    const novaLoja = { ...loja, id };
    this.setItem(this.STORAGE_KEY, [...lojas, novaLoja]);
    return novaLoja;
  }

  updateLoja(loja: Loja): void {
    const lojas = this.getLojas();
    const index = lojas.findIndex(l => l.id === loja.id);
    if (index >= 0) {
      lojas[index] = loja;
      this.setItem(this.STORAGE_KEY, lojas);
    }
  }

  deleteLoja(id: number): void {
    const lojas = this.getLojas().filter(l => l.id !== id);
    this.setItem(this.STORAGE_KEY, lojas);
  }
}

export const lojaService = new LojaService();
