
// Atualizar a interface de Usuário para incluir senha
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role?: string;
  senha: string; // Tornar senha um campo obrigatório
}
