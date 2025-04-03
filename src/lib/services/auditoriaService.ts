
import { Auditoria, Resposta } from '../types';
import { BaseService } from './baseService';
import { respostaService } from './respostaService';

export class AuditoriaService extends BaseService {
  private readonly STORAGE_KEY = 'auditorias';

  getAuditorias(): Auditoria[] {
    return this.getItem<Auditoria>(this.STORAGE_KEY);
  }

  getAuditoria(id: number): Auditoria | undefined {
    return this.getAuditorias().find(a => a.id === id);
  }

  addAuditoria(auditoria: Omit<Auditoria, "id">): Auditoria {
    const auditorias = this.getAuditorias();
    const id = this.getMaxId(auditorias);
    const novaAuditoria = { ...auditoria, id };
    this.setItem(this.STORAGE_KEY, [...auditorias, novaAuditoria]);
    return novaAuditoria;
  }

  updateAuditoria(auditoria: Auditoria): void {
    const auditorias = this.getAuditorias();
    const index = auditorias.findIndex(a => a.id === auditoria.id);
    if (index >= 0) {
      auditorias[index] = auditoria;
      this.setItem(this.STORAGE_KEY, auditorias);
    }
  }

  deleteAuditoria(id: number): void {
    const auditorias = this.getAuditorias().filter(a => a.id !== id);
    this.setItem(this.STORAGE_KEY, auditorias);
    
    // Remove associated responses
    respostaService.deleteRespostasByAuditoria(id);
  }
}

export const auditoriaService = new AuditoriaService();
