
import { lojaService } from './lojaService';
import { secaoService } from './secaoService';
import { perguntaService } from './perguntaService';
import { usuarioService } from './usuarioService';

/**
 * Initialize the database with sample data
 */
export function initDatabase() {
  // Check if data already exists in localStorage
  if (!localStorage.getItem('lojas')) {
    // Initial stores
    const lojas = [
      { id: 1, numero: "001", nome: "Loja Centro" },
      { id: 2, numero: "002", nome: "Loja Shopping" }
    ];
    localStorage.setItem('lojas', JSON.stringify(lojas));

    // Initial sections
    const secoes = [
      { id: 1, nome: "Caixas" },
      { id: 2, nome: "Cozinha" },
      { id: 3, nome: "Equipamentos e materiais" },
      { id: 4, nome: "Equipe/Pessoal Gerente" },
      { id: 5, nome: "Estoque" },
      { id: 6, nome: "Jornal" },
      { id: 7, nome: "Loja" },
      { id: 8, nome: "Operadora de Caixa" },
      { id: 9, nome: "Performance" },
      { id: 10, nome: "Rotinas Diárias" },
      { id: 11, nome: "Vendas" },
      { id: 12, nome: "Vendedora / Aux. de Loja" },
      { id: 13, nome: "Vitrine" }
    ];
    localStorage.setItem('secoes', JSON.stringify(secoes));

    // Initial questions
    const perguntas = [
      { id: 1, secao_id: 1, texto: "O caixa está livre de café ou alimentos?" },
      { id: 2, secao_id: 1, texto: "O caixa está organizado e limpo?" },
      { id: 3, secao_id: 1, texto: "Está sem excesso de produtos?" },
      { id: 4, secao_id: 1, texto: "Esta com sacolas e embalagens para presente repostos e organizados?" },
      { id: 5, secao_id: 1, texto: "Possui folha padrão para anotação de vendas (caso o sistema caia) impresso?" },

      { id: 6, secao_id: 2, texto: "Copos, talheres e acessórios da cozinha, estão limpos e organizados?" },
      { id: 7, secao_id: 2, texto: "Geladeira esta limpa e sem restos de comida?" },
      { id: 8, secao_id: 2, texto: "Banheiro limpo?" },

      { id: 9, secao_id: 3, texto: "Os documentos exigidos pelos órgãos públicos de fiscalização estão de fácil acesso?" },
      { id: 10, secao_id: 3, texto: "A impressora de sulfite está funcionando corretamente?" },
      { id: 11, secao_id: 3, texto: "A(s) impressora(s) fiscai(s) estão funcionando corretamente?" },
      { id: 12, secao_id: 3, texto: "Todos os monitores estão funcionando corretamente?" },
      { id: 13, secao_id: 3, texto: "Todos os teclados estão funcionando corretamente?" },
      { id: 14, secao_id: 3, texto: "Todos os mouses estão funcionando corretamente?" },
      { id: 15, secao_id: 3, texto: "Todos os leitores de códigos de barras estão funcionando corretamente?" },
      { id: 16, secao_id: 3, texto: "A internet está funcionando corretamente?" },
      { id: 17, secao_id: 3, texto: "O telefone está funcionando corretamente?" },
      { id: 18, secao_id: 3, texto: "Os computadores trabalham em uma velocidade razoável?" },
      { id: 19, secao_id: 3, texto: "As máquinas de cartão estão funcionando corretamente?" },
      { id: 20, secao_id: 3, texto: "Todos os sistemas estão em pleno funcionamento?" },
      { id: 21, secao_id: 3, texto: "O busca preço está funcionando?" },
      { id: 22, secao_id: 3, texto: "Está solicitando reposição dos materiais de consumo semanalmente?" },
      { id: 23, secao_id: 3, texto: "Ar condicionado funcionando?" },
      { id: 24, secao_id: 3, texto: "Existe alguma Manutenção Pendente?" },

      { id: 25, secao_id: 4, texto: "Mural está atualizado?" },
      { id: 26, secao_id: 4, texto: "Possui boa apresentação e higiene pessoal?" },
      { id: 27, secao_id: 4, texto: "O uniforme está conforme regulamento com as roupas em bom estado e limpas?" },
      { id: 28, secao_id: 4, texto: "Possui domínio sobre a campanha promocional vigente?" },
      { id: 29, secao_id: 4, texto: "Tem conhecimento das ferramentas gerenciais e acompanha os dados de vendas?" },
      { id: 30, secao_id: 4, texto: "A ficha de Acompanhamento Individual de Vendas está sendo preenchida diariamente?" },
      { id: 31, secao_id: 4, texto: "A planilha de Acompanhamento de Vendas Mensal está sendo devidamente preenchida?" },
      { id: 32, secao_id: 4, texto: "Esta realizando o treinamento?" },
      { id: 33, secao_id: 4, texto: "Realiza reunião Mensal com equipe?" },
      { id: 34, secao_id: 4, texto: "Realiza a Ficha Cadh com equipe?" }
    ];
    localStorage.setItem('perguntas', JSON.stringify(perguntas));

    // Initial users
    const usuarios = [
      { id: 1, nome: "Auditor 1", email: "auditor1@exemplo.com" },
      { id: 2, nome: "Administrador", email: "admin@exemplo.com" }
    ];
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Initially empty audits
    localStorage.setItem('auditorias', JSON.stringify([]));
    localStorage.setItem('respostas', JSON.stringify([]));
  }
}
