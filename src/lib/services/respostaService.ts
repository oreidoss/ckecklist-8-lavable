
import { Resposta } from '../types';
import { BaseService } from './baseService';

export class RespostaService extends BaseService {
  private readonly STORAGE_KEY = 'respostas';

  getRespostas(): Resposta[] {
    return this.getItem<Resposta>(this.STORAGE_KEY);
  }

  getRespostasByAuditoria(auditoriaId: string): Resposta[] {
    return this.getRespostas().filter(r => r.auditoria_id === auditoriaId);
  }

  addResposta(resposta: Omit<Resposta, "id">): Resposta {
    const respostas = this.getRespostas();
    const id = this.getMaxId(respostas);
    const novaResposta = { ...resposta, id };
    this.setItem(this.STORAGE_KEY, [...respostas, novaResposta]);
    return novaResposta;
  }

  updateResposta(resposta: Resposta): void {
    const respostas = this.getRespostas();
    const index = respostas.findIndex(r => r.id === resposta.id);
    if (index >= 0) {
      respostas[index] = resposta;
      this.setItem(this.STORAGE_KEY, respostas);
    }
  }

  deleteResposta(id: string): void {
    const respostas = this.getRespostas().filter(r => r.id !== id);
    this.setItem(this.STORAGE_KEY, respostas);
  }

  deleteRespostasByAuditoria(auditoriaId: string): void {
    const respostas = this.getRespostas().filter(r => r.auditoria_id !== auditoriaId);
    this.setItem(this.STORAGE_KEY, respostas);
  }
}

export const respostaService = new RespostaService();
