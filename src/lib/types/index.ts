
// Define all types used in the application

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
  role?: 'admin' | 'user' | 'supervisor' | 'gerente';
  funcao?: string; // Add the funcao field to match Supabase schema
}

export interface Auditoria {
  id: string;
  data: string;
  loja_id: string;
  usuario_id: string;
  status: string; // Changed from enum to string for compatibility with current data
  pontuacao_total: number;
  gerente?: string;
  supervisor?: string;
  loja?: Loja; // Added loja reference
  usuario?: Usuario; // Added usuario reference
}

export interface Resposta {
  id: string;
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string;
  anexo_url?: string;
  created_at: string; // Added created_at field to match database schema
}

export interface RespostaFormData {
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string;
  anexo_url?: string;
}

// Add any other required types below
