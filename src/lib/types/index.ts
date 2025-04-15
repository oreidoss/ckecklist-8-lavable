
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  funcao?: string;
  role?: 'admin' | 'user' | 'supervisor' | 'gerente';
  senha?: string;
}

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
  secao_id?: string;
}

export interface Resposta {
  id: string;
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string;
  anexo_url?: string;
  created_at?: string;
}

export interface Auditoria {
  id: string;
  loja_id: string;
  usuario_id: string;
  data?: string;
  status: 'em_andamento' | 'concluido';
  pontuacao_total: number;
  supervisor?: string;
  gerente?: string;
  loja?: Loja;
  usuario?: Usuario;
  respostas?: Resposta[];  // Added this property
  perguntas_count?: number;  // Added this property
}
