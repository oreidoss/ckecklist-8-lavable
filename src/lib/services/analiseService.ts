
import { Secao } from '../types';
import { secaoService } from './secaoService';
import { perguntaService } from './perguntaService';
import { respostaService } from './respostaService';

export class AnaliseService {
  calcularPontuacaoTotal(auditoriaId: string): number {
    const respostas = respostaService.getRespostasByAuditoria(auditoriaId);
    return respostas.reduce((total, resposta) => total + resposta.pontuacao_obtida, 0);
  }

  calcularPontuacaoPorSecao(auditoriaId: string): Record<string, number> {
    const respostas = respostaService.getRespostasByAuditoria(auditoriaId);
    const perguntas = perguntaService.getPerguntas();
    
    const pontuacaoPorSecao: Record<string, { total: number, count: number }> = {};
    
    // Initialize scores by section
    secaoService.getSecoes().forEach(secao => {
      pontuacaoPorSecao[secao.id] = { total: 0, count: 0 };
    });
    
    // Calculate score by section
    respostas.forEach(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      if (pergunta) {
        const secaoId = pergunta.secao_id;
        pontuacaoPorSecao[secaoId].total += resposta.pontuacao_obtida;
        pontuacaoPorSecao[secaoId].count += 1;
      }
    });
    
    // Calculate average score by section
    const resultado: Record<string, number> = {};
    Object.entries(pontuacaoPorSecao).forEach(([secaoId, { total, count }]) => {
      resultado[secaoId] = count > 0 ? total : 0;
    });
    
    return resultado;
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
