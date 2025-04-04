
// Update the Resposta interface to include the optional observacao property
export interface Resposta {
  id: string;
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string; // Add this optional property
}

// Also update the RespostaFormData to match
export interface RespostaFormData {
  auditoria_id: string;
  pergunta_id: string;
  resposta: string;
  pontuacao_obtida: number;
  observacao?: string; // Add this optional property here as well
}
