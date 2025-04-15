
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
  respostas?: Resposta[];  // Added this line
  perguntas_count?: number;  // Added this line
}
