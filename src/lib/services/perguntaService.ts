
import { Pergunta } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';

export class PerguntaService extends BaseService {
  private readonly STORAGE_KEY = 'perguntas';
  private cachedPerguntas: Pergunta[] | null = null;

  async fetchPerguntasFromSupabase(): Promise<Pergunta[]> {
    try {
      console.log('Buscando perguntas do Supabase...');
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .order('secao_id, id');
      
      if (error) {
        console.error('Erro ao buscar perguntas do Supabase:', error);
        throw error;
      }
      
      console.log(`Encontradas ${data.length} perguntas no Supabase`);
      this.cachedPerguntas = data;
      this.setItem(this.STORAGE_KEY, data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      // Fallback para localStorage
      return this.getPerguntas();
    }
  }

  getPerguntas(): Pergunta[] {
    if (this.cachedPerguntas) {
      return this.cachedPerguntas;
    }
    
    const perguntas = this.getItem<Pergunta>(this.STORAGE_KEY);
    
    // Se não tiver perguntas armazenadas, iniciar uma busca assíncrona
    if (!perguntas || perguntas.length === 0) {
      this.fetchPerguntasFromSupabase().catch(console.error);
      return [];
    }
    
    this.cachedPerguntas = perguntas;
    return perguntas;
  }

  getPerguntasBySecao(secaoId: string): Pergunta[] {
    const perguntas = this.getPerguntas();
    const filtradas = perguntas.filter(p => p.secao_id === secaoId);
    console.log(`Filtrando perguntas para seção ${secaoId}: ${filtradas.length} encontradas`);
    return filtradas;
  }

  addPergunta(pergunta: Omit<Pergunta, "id">): Pergunta {
    const perguntas = this.getPerguntas();
    const id = this.getMaxId(perguntas);
    const novaPergunta = { ...pergunta, id };
    this.setItem(this.STORAGE_KEY, [...perguntas, novaPergunta]);
    this.cachedPerguntas = null; // Limpar cache
    return novaPergunta;
  }

  updatePergunta(pergunta: Pergunta): void {
    const perguntas = this.getPerguntas();
    const index = perguntas.findIndex(p => p.id === pergunta.id);
    if (index >= 0) {
      perguntas[index] = pergunta;
      this.setItem(this.STORAGE_KEY, perguntas);
      this.cachedPerguntas = null; // Limpar cache
    }
  }

  deletePergunta(id: string): void {
    const perguntas = this.getPerguntas().filter(p => p.id !== id);
    this.setItem(this.STORAGE_KEY, perguntas);
    this.cachedPerguntas = null; // Limpar cache
  }
}

export const perguntaService = new PerguntaService();
