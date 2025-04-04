
import { Loja } from '../types';
import { BaseService } from './baseService';
import { supabase } from '@/integrations/supabase/client';

export class LojaService extends BaseService {
  private readonly STORAGE_KEY = 'lojas';

  async getLojas(): Promise<Loja[]> {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('lojas')
        .select('*');
      
      if (error) {
        console.error('Error fetching lojas from Supabase:', error);
        // Fallback to local storage if Supabase fails
        return this.getItem<Loja>(this.STORAGE_KEY);
      }
      
      // Transform the data to match our expected format
      return data.map(loja => ({
        id: loja.id.toString(),
        nome: loja.nome,
        numero: loja.numero
      }));
    } catch (err) {
      console.error('Error in getLojas:', err);
      // Fallback to local storage
      return this.getItem<Loja>(this.STORAGE_KEY);
    }
  }

  async addLoja(loja: Omit<Loja, "id">): Promise<Loja> {
    try {
      // Try to add to Supabase first
      const { data, error } = await supabase
        .from('lojas')
        .insert([{ nome: loja.nome, numero: loja.numero }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding loja to Supabase:', error);
        // Fallback to local storage if Supabase fails
        const lojas = this.getItem<Loja>(this.STORAGE_KEY);
        const id = this.getMaxId(lojas);
        const novaLoja = { ...loja, id };
        this.setItem(this.STORAGE_KEY, [...lojas, novaLoja]);
        return novaLoja;
      }
      
      // Return the new loja with the correct ID format
      return {
        id: data.id.toString(),
        nome: data.nome,
        numero: data.numero
      };
    } catch (err) {
      console.error('Error in addLoja:', err);
      // Fallback to local storage
      const lojas = this.getItem<Loja>(this.STORAGE_KEY);
      const id = this.getMaxId(lojas);
      const novaLoja = { ...loja, id };
      this.setItem(this.STORAGE_KEY, [...lojas, novaLoja]);
      return novaLoja;
    }
  }

  async updateLoja(loja: Loja): Promise<void> {
    try {
      // Try to update in Supabase first
      const { error } = await supabase
        .from('lojas')
        .update({ nome: loja.nome, numero: loja.numero })
        .eq('id', loja.id);
      
      if (error) {
        console.error('Error updating loja in Supabase:', error);
        // Fallback to local storage if Supabase fails
        const lojas = this.getItem<Loja>(this.STORAGE_KEY);
        const index = lojas.findIndex(l => l.id === loja.id);
        if (index >= 0) {
          lojas[index] = loja;
          this.setItem(this.STORAGE_KEY, lojas);
        }
      }
    } catch (err) {
      console.error('Error in updateLoja:', err);
      // Fallback to local storage
      const lojas = this.getItem<Loja>(this.STORAGE_KEY);
      const index = lojas.findIndex(l => l.id === loja.id);
      if (index >= 0) {
        lojas[index] = loja;
        this.setItem(this.STORAGE_KEY, lojas);
      }
    }
  }

  async deleteLoja(id: string): Promise<void> {
    try {
      // Try to delete from Supabase first
      const { error } = await supabase
        .from('lojas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting loja from Supabase:', error);
        // Fallback to local storage if Supabase fails
        const lojas = this.getItem<Loja>(this.STORAGE_KEY).filter(l => l.id !== id);
        this.setItem(this.STORAGE_KEY, lojas);
      }
    } catch (err) {
      console.error('Error in deleteLoja:', err);
      // Fallback to local storage
      const lojas = this.getItem<Loja>(this.STORAGE_KEY).filter(l => l.id !== id);
      this.setItem(this.STORAGE_KEY, lojas);
    }
  }
}

export const lojaService = new LojaService();
