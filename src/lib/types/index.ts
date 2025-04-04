
// Basic types
export interface Loja {
  id: string;
  nome: string;
  numero: string;
}

export interface Secao {
  id: string;
  nome: string;
}

export interface Pergunta {
  id: string;
  texto: string;
  secao_id: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  role?: string;
}

export interface Auditoria {
  id: string;
  data: string;
  loja_id: string;
  usuario_id: string;
  gerente?: string;
  supervisor?: string;
  status?: string;
  pontuacao_total: number;
}

export interface Resposta {
  id: string;
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string; // Optional observation field
}

// Form types
export interface SecaoFormData {
  nome: string;
}

export interface PerguntaFormData {
  texto: string;
  secao_id: string;
}

export interface LojaFormData {
  nome: string;
  numero: string;
}

export interface UsuarioFormData {
  nome: string;
  email: string;
  senha: string;
  role?: string;
}

export interface LoginFormData {
  nome: string;
  senha: string;
}

export interface AuditoriaFormData {
  loja_id: string;
  data: string;
  gerente?: string;
  supervisor?: string;
}

export interface RespostaFormData {
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string; // Optional observation field
}
