
import { Secao } from '../types';
import { secaoService } from './secaoService';
import { perguntaService } from './perguntaService';
import { respostaService } from './respostaService';
import { supabase } from '@/integrations/supabase/client';

export class AnaliseService {
  calcularPontuacaoTotal(auditoriaId: string): number {
    const respostas = respostaService.getRespostasByAuditoria(auditoriaId);
    return respostas.reduce((total, resposta) => total + (resposta.pontuacao_obtida || 0), 0);
  }

  async calcularPontuacaoPorSecaoSupabase(auditoriaId: string): Promise<Record<string, number>> {
    if (!auditoriaId) return {};
    
    try {
      // Fetch all responses for this auditoria
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('auditoria_id', auditoriaId);
        
      if (respostasError) throw respostasError;

      // Fetch all perguntas to map them to secoes
      const { data: perguntas, error: perguntasError } = await supabase
        .from('perguntas')
        .select('*');
        
      if (perguntasError) throw perguntasError;

      // Fetch all secoes to initialize the scores
      const { data: secoes, error: secoesError } = await supabase
        .from('secoes')
        .select('*');
        
      if (secoesError) throw secoesError;
      
      // Initialize scores by section
      const pontuacaoPorSecao: Record<string, number> = {};
      secoes.forEach(secao => {
        pontuacaoPorSecao[secao.id] = 0;
      });
      
      // Calculate score by section
      respostas.forEach(resposta => {
        const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
        if (pergunta) {
          const secaoId = pergunta.secao_id;
          pontuacaoPorSecao[secaoId] = (pontuacaoPorSecao[secaoId] || 0) + (resposta.pontuacao_obtida || 0);
        }
      });
      
      console.log('Pontuação por seção (Supabase):', pontuacaoPorSecao);
      return pontuacaoPorSecao;
    } catch (error) {
      console.error("Error calculating section scores from Supabase:", error);
      return this.calcularPontuacaoPorSecao(auditoriaId); // Fallback to local calculation
    }
  }

  calcularPontuacaoPorSecao(auditoriaId: string): Record<string, number> {
    if (!auditoriaId) return {};
    
    const respostas = respostaService.getRespostasByAuditoria(auditoriaId);
    const perguntas = perguntaService.getPerguntas();
    
    const pontuacaoPorSecao: Record<string, number> = {};
    
    // Initialize scores by section
    secaoService.getSecoes().forEach(secao => {
      pontuacaoPorSecao[secao.id] = 0;
    });
    
    // Calculate score by section
    respostas.forEach(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      if (pergunta) {
        const secaoId = pergunta.secao_id;
        pontuacaoPorSecao[secaoId] = (pontuacaoPorSecao[secaoId] || 0) + (resposta.pontuacao_obtida || 0);
      }
    });
    
    console.log('Pontuação por seção (Local):', pontuacaoPorSecao);
    return pontuacaoPorSecao;
  }

  identificarPontosCriticos(auditoriaId: string): { secaoId: string, nome: string, pontuacao: number }[] {
    const pontuacaoPorSecao = this.calcularPontuacaoPorSecao(auditoriaId);
    const secoes = secaoService.getSecoes();
    
    return Object.entries(pontuacaoPorSecao)
      .map(([secaoId, pontuacao]) => {
        const secao = secoes.find(s => s.id === secaoId);
        return {
          secaoId,
          nome: secao ? secao.nome : 'Desconhecido',
          pontuacao
        };
      })
      .filter(item => item.pontuacao <= 0)
      .sort((a, b) => a.pontuacao - b.pontuacao);
  }
}

export const analiseService = new AnaliseService();
