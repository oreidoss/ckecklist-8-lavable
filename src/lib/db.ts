
// Tipos de dados
export interface Loja {
  id: number;
  numero: string;
  nome: string;
}

export interface Secao {
  id: number;
  nome: string;
}

export interface Pergunta {
  id: number;
  secao_id: number;
  texto: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Auditoria {
  id: number;
  loja_id: number;
  usuario_id: number;
  data: string;
  pontuacao_total: number;
}

export interface Resposta {
  id: number;
  auditoria_id: number;
  pergunta_id: number;
  resposta: "Sim" | "Não" | "Regular" | "Não se aplica";
  pontuacao_obtida: number;
}

// Mapeamento de respostas para pontuações
export const pontuacaoMap = {
  "Sim": 1,
  "Não": -1,
  "Regular": 0.5,
  "Não se aplica": 0
};

// Classe para gerenciar o banco de dados local
class DatabaseService {
  // Inicializa o banco de dados com dados de exemplo
  initDatabase() {
    // Verifica se já existe dados no localStorage
    if (!localStorage.getItem('lojas')) {
      // Lojas iniciais
      const lojas: Loja[] = [
        { id: 1, numero: "001", nome: "Loja Centro" },
        { id: 2, numero: "002", nome: "Loja Shopping" }
      ];
      localStorage.setItem('lojas', JSON.stringify(lojas));

      // Seções iniciais
      const secoes: Secao[] = [
        { id: 1, nome: "Limpeza" },
        { id: 2, nome: "Organização" },
        { id: 3, nome: "Atendimento" }
      ];
      localStorage.setItem('secoes', JSON.stringify(secoes));

      // Perguntas iniciais
      const perguntas: Pergunta[] = [
        { id: 1, secao_id: 1, texto: "A loja está limpa e sem poeira?" },
        { id: 2, secao_id: 1, texto: "Os banheiros estão higienizados?" },
        { id: 3, secao_id: 2, texto: "As prateleiras estão organizadas?" },
        { id: 4, secao_id: 2, texto: "Os produtos estão etiquetados corretamente?" },
        { id: 5, secao_id: 3, texto: "Os funcionários estão uniformizados?" },
        { id: 6, secao_id: 3, texto: "O tempo de espera no caixa é aceitável?" }
      ];
      localStorage.setItem('perguntas', JSON.stringify(perguntas));

      // Usuários iniciais
      const usuarios: Usuario[] = [
        { id: 1, nome: "Auditor 1", email: "auditor1@exemplo.com" },
        { id: 2, nome: "Administrador", email: "admin@exemplo.com" }
      ];
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Auditorias vazias inicialmente
      localStorage.setItem('auditorias', JSON.stringify([]));
      localStorage.setItem('respostas', JSON.stringify([]));
    }
  }

  // Métodos para lojas
  getLojas(): Loja[] {
    const lojas = localStorage.getItem('lojas');
    return lojas ? JSON.parse(lojas) : [];
  }

  addLoja(loja: Omit<Loja, "id">): Loja {
    const lojas = this.getLojas();
    const id = lojas.length > 0 ? Math.max(...lojas.map(l => l.id)) + 1 : 1;
    const novaLoja = { ...loja, id };
    localStorage.setItem('lojas', JSON.stringify([...lojas, novaLoja]));
    return novaLoja;
  }

  updateLoja(loja: Loja): void {
    const lojas = this.getLojas();
    const index = lojas.findIndex(l => l.id === loja.id);
    if (index >= 0) {
      lojas[index] = loja;
      localStorage.setItem('lojas', JSON.stringify(lojas));
    }
  }

  deleteLoja(id: number): void {
    const lojas = this.getLojas().filter(l => l.id !== id);
    localStorage.setItem('lojas', JSON.stringify(lojas));
  }

  // Métodos para seções
  getSecoes(): Secao[] {
    const secoes = localStorage.getItem('secoes');
    return secoes ? JSON.parse(secoes) : [];
  }

  addSecao(secao: Omit<Secao, "id">): Secao {
    const secoes = this.getSecoes();
    const id = secoes.length > 0 ? Math.max(...secoes.map(s => s.id)) + 1 : 1;
    const novaSecao = { ...secao, id };
    localStorage.setItem('secoes', JSON.stringify([...secoes, novaSecao]));
    return novaSecao;
  }

  updateSecao(secao: Secao): void {
    const secoes = this.getSecoes();
    const index = secoes.findIndex(s => s.id === secao.id);
    if (index >= 0) {
      secoes[index] = secao;
      localStorage.setItem('secoes', JSON.stringify(secoes));
    }
  }

  deleteSecao(id: number): void {
    const secoes = this.getSecoes().filter(s => s.id !== id);
    localStorage.setItem('secoes', JSON.stringify(secoes));
  }

  // Métodos para perguntas
  getPerguntas(): Pergunta[] {
    const perguntas = localStorage.getItem('perguntas');
    return perguntas ? JSON.parse(perguntas) : [];
  }

  getPerguntasBySecao(secaoId: number): Pergunta[] {
    return this.getPerguntas().filter(p => p.secao_id === secaoId);
  }

  addPergunta(pergunta: Omit<Pergunta, "id">): Pergunta {
    const perguntas = this.getPerguntas();
    const id = perguntas.length > 0 ? Math.max(...perguntas.map(p => p.id)) + 1 : 1;
    const novaPergunta = { ...pergunta, id };
    localStorage.setItem('perguntas', JSON.stringify([...perguntas, novaPergunta]));
    return novaPergunta;
  }

  updatePergunta(pergunta: Pergunta): void {
    const perguntas = this.getPerguntas();
    const index = perguntas.findIndex(p => p.id === pergunta.id);
    if (index >= 0) {
      perguntas[index] = pergunta;
      localStorage.setItem('perguntas', JSON.stringify(perguntas));
    }
  }

  deletePergunta(id: number): void {
    const perguntas = this.getPerguntas().filter(p => p.id !== id);
    localStorage.setItem('perguntas', JSON.stringify(perguntas));
  }

  // Métodos para usuários
  getUsuarios(): Usuario[] {
    const usuarios = localStorage.getItem('usuarios');
    return usuarios ? JSON.parse(usuarios) : [];
  }

  addUsuario(usuario: Omit<Usuario, "id">): Usuario {
    const usuarios = this.getUsuarios();
    const id = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    const novoUsuario = { ...usuario, id };
    localStorage.setItem('usuarios', JSON.stringify([...usuarios, novoUsuario]));
    return novoUsuario;
  }

  updateUsuario(usuario: Usuario): void {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    if (index >= 0) {
      usuarios[index] = usuario;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  }

  deleteUsuario(id: number): void {
    const usuarios = this.getUsuarios().filter(u => u.id !== id);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Métodos para auditorias
  getAuditorias(): Auditoria[] {
    const auditorias = localStorage.getItem('auditorias');
    return auditorias ? JSON.parse(auditorias) : [];
  }

  getAuditoria(id: number): Auditoria | undefined {
    return this.getAuditorias().find(a => a.id === id);
  }

  addAuditoria(auditoria: Omit<Auditoria, "id">): Auditoria {
    const auditorias = this.getAuditorias();
    const id = auditorias.length > 0 ? Math.max(...auditorias.map(a => a.id)) + 1 : 1;
    const novaAuditoria = { ...auditoria, id };
    localStorage.setItem('auditorias', JSON.stringify([...auditorias, novaAuditoria]));
    return novaAuditoria;
  }

  updateAuditoria(auditoria: Auditoria): void {
    const auditorias = this.getAuditorias();
    const index = auditorias.findIndex(a => a.id === auditoria.id);
    if (index >= 0) {
      auditorias[index] = auditoria;
      localStorage.setItem('auditorias', JSON.stringify(auditorias));
    }
  }

  deleteAuditoria(id: number): void {
    const auditorias = this.getAuditorias().filter(a => a.id !== id);
    localStorage.setItem('auditorias', JSON.stringify(auditorias));
    
    // Remover respostas associadas
    const respostas = this.getRespostas().filter(r => r.auditoria_id !== id);
    localStorage.setItem('respostas', JSON.stringify(respostas));
  }

  // Métodos para respostas
  getRespostas(): Resposta[] {
    const respostas = localStorage.getItem('respostas');
    return respostas ? JSON.parse(respostas) : [];
  }

  getRespostasByAuditoria(auditoriaId: number): Resposta[] {
    return this.getRespostas().filter(r => r.auditoria_id === auditoriaId);
  }

  addResposta(resposta: Omit<Resposta, "id">): Resposta {
    const respostas = this.getRespostas();
    const id = respostas.length > 0 ? Math.max(...respostas.map(r => r.id)) + 1 : 1;
    const novaResposta = { ...resposta, id };
    localStorage.setItem('respostas', JSON.stringify([...respostas, novaResposta]));
    return novaResposta;
  }

  updateResposta(resposta: Resposta): void {
    const respostas = this.getRespostas();
    const index = respostas.findIndex(r => r.id === resposta.id);
    if (index >= 0) {
      respostas[index] = resposta;
      localStorage.setItem('respostas', JSON.stringify(respostas));
    }
  }

  deleteResposta(id: number): void {
    const respostas = this.getRespostas().filter(r => r.id !== id);
    localStorage.setItem('respostas', JSON.stringify(respostas));
  }

  // Cálculos e relatórios
  calcularPontuacaoTotal(auditoriaId: number): number {
    const respostas = this.getRespostasByAuditoria(auditoriaId);
    return respostas.reduce((total, resposta) => total + resposta.pontuacao_obtida, 0);
  }

  calcularPontuacaoPorSecao(auditoriaId: number): Record<number, number> {
    const respostas = this.getRespostasByAuditoria(auditoriaId);
    const perguntas = this.getPerguntas();
    
    const pontuacaoPorSecao: Record<number, { total: number, count: number }> = {};
    
    // Inicializa pontuações por seção
    this.getSecoes().forEach(secao => {
      pontuacaoPorSecao[secao.id] = { total: 0, count: 0 };
    });
    
    // Calcula pontuação por seção
    respostas.forEach(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      if (pergunta) {
        const secaoId = pergunta.secao_id;
        pontuacaoPorSecao[secaoId].total += resposta.pontuacao_obtida;
        pontuacaoPorSecao[secaoId].count += 1;
      }
    });
    
    // Calcula média da pontuação por seção
    const resultado: Record<number, number> = {};
    Object.entries(pontuacaoPorSecao).forEach(([secaoId, { total, count }]) => {
      resultado[Number(secaoId)] = count > 0 ? total : 0;
    });
    
    return resultado;
  }

  identificarPontosCriticos(auditoriaId: number): { secaoId: number, nome: string, pontuacao: number }[] {
    const pontuacaoPorSecao = this.calcularPontuacaoPorSecao(auditoriaId);
    const secoes = this.getSecoes();
    
    return Object.entries(pontuacaoPorSecao)
      .map(([secaoId, pontuacao]) => {
        const secao = secoes.find(s => s.id === Number(secaoId));
        return {
          secaoId: Number(secaoId),
          nome: secao ? secao.nome : 'Desconhecido',
          pontuacao
        };
      })
      .filter(item => item.pontuacao <= 0) // Pontos críticos são aqueles com pontuação negativa ou zero
      .sort((a, b) => a.pontuacao - b.pontuacao); // Ordena por pontuação, do menor para o maior
  }
}

export const db = new DatabaseService();
