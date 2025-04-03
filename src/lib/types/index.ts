
// Atualizar a interface de Usuário para incluir senha
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role?: string;
  senha: string; // Tornar senha um campo obrigatório
}

// Types of data
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

export interface Auditoria {
  id: number;
  loja_id: number;
  usuario_id: number;
  data: string;
  pontuacao_total: number;
  status?: string;
  supervisor?: string;
  gerente?: string;
}

export interface Resposta {
  id: number;
  auditoria_id: number;
  pergunta_id: number;
  resposta: "Sim" | "Não" | "Regular" | "Não se aplica";
  pontuacao_obtida: number;
}

// Mapping of responses to scores
export const pontuacaoMap = {
  "Sim": 1,
  "Não": -1,
  "Regular": 0.5,
  "Não se aplica": 0
};

// Role types for user management
export type UserRole = "supervisor" | "gerente" | "admin" | "";
