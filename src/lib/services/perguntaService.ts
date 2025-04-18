
import { Pergunta } from '../types';
import { BaseService } from './baseService';

export class PerguntaService extends BaseService {
  private readonly STORAGE_KEY = 'perguntas';

  getPerguntas(): Pergunta[] {
    return this.getItem<Pergunta>(this.STORAGE_KEY);
  }

  getPerguntasBySecao(secaoId: string): Pergunta[] {
    return this.getPerguntas().filter(p => p.secao_id === secaoId);
  }

  addPergunta(pergunta: Omit<Pergunta, "id">): Pergunta {
    const perguntas = this.getPerguntas();
    const id = this.getMaxId(perguntas);
    const novaPergunta = { ...pergunta, id };
    this.setItem(this.STORAGE_KEY, [...perguntas, novaPergunta]);
    return novaPergunta;
  }

  updatePergunta(pergunta: Pergunta): void {
    const perguntas = this.getPerguntas();
    const index = perguntas.findIndex(p => p.id === pergunta.id);
    if (index >= 0) {
      perguntas[index] = pergunta;
      this.setItem(this.STORAGE_KEY, perguntas);
    }
  }

  deletePergunta(id: string): void {
    // Due to cascade delete in the database, we only need to remove the pergunta
    // All related records will be automatically deleted
    const perguntas = this.getPerguntas().filter(p => p.id !== id);
    this.setItem(this.STORAGE_KEY, perguntas);
  }
}

export const perguntaService = new PerguntaService();
