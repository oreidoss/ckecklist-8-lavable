
// Export all types
export * from './types';

// Export all services
import { lojaService } from './services/lojaService';
import { secaoService } from './services/secaoService';
import { perguntaService } from './services/perguntaService';
import { usuarioService } from './services/usuarioService';
import { authService } from './services/authService';
import { auditoriaService } from './services/auditoriaService';
import { respostaService } from './services/respostaService';
import { analiseService } from './services/analiseService';
import { initDatabase } from './services/initDatabase';

// Create a database object for legacy usage
class DatabaseService {
  initDatabase = initDatabase;

  // Loja methods
  getLojas = lojaService.getLojas.bind(lojaService);
  addLoja = lojaService.addLoja.bind(lojaService);
  updateLoja = lojaService.updateLoja.bind(lojaService);
  deleteLoja = lojaService.deleteLoja.bind(lojaService);

  // Secao methods
  getSecoes = secaoService.getSecoes.bind(secaoService);
  addSecao = secaoService.addSecao.bind(secaoService);
  updateSecao = secaoService.updateSecao.bind(secaoService);
  deleteSecao = secaoService.deleteSecao.bind(secaoService);

  // Pergunta methods
  getPerguntas = perguntaService.getPerguntas.bind(perguntaService);
  getPerguntasBySecao = perguntaService.getPerguntasBySecao.bind(perguntaService);
  addPergunta = perguntaService.addPergunta.bind(perguntaService);
  updatePergunta = perguntaService.updatePergunta.bind(perguntaService);
  deletePergunta = perguntaService.deletePergunta.bind(perguntaService);

  // Usuario methods
  getUsuarios = usuarioService.getUsuarios.bind(usuarioService);
  addUsuario = usuarioService.addUsuario.bind(usuarioService);
  updateUsuario = usuarioService.updateUsuario.bind(usuarioService);
  deleteUsuario = usuarioService.deleteUsuario.bind(usuarioService);

  // Auth methods (now from authService but maintaining backward compatibility)
  login = authService.login.bind(authService);
  logout = authService.logout.bind(authService);
  getCurrentUser = authService.getCurrentUser.bind(authService);
  verificarCredenciais = authService.verificarCredenciais.bind(authService);
  isAdmin = authService.isAdmin.bind(authService);

  // Auditoria methods
  getAuditorias = auditoriaService.getAuditorias.bind(auditoriaService);
  getAuditoria = auditoriaService.getAuditoria.bind(auditoriaService);
  addAuditoria = auditoriaService.addAuditoria.bind(auditoriaService);
  updateAuditoria = auditoriaService.updateAuditoria.bind(auditoriaService);
  deleteAuditoria = auditoriaService.deleteAuditoria.bind(auditoriaService);

  // Resposta methods
  getRespostas = respostaService.getRespostas.bind(respostaService);
  getRespostasByAuditoria = respostaService.getRespostasByAuditoria.bind(respostaService);
  addResposta = respostaService.addResposta.bind(respostaService);
  updateResposta = respostaService.updateResposta.bind(respostaService);
  deleteResposta = respostaService.deleteResposta.bind(respostaService);

  // Analysis methods
  calcularPontuacaoTotal = analiseService.calcularPontuacaoTotal.bind(analiseService);
  calcularPontuacaoPorSecao = analiseService.calcularPontuacaoPorSecao.bind(analiseService);
  identificarPontosCriticos = analiseService.identificarPontosCriticos.bind(analiseService);
}

// Create a new database service that maintains backward compatibility
export const db = new DatabaseService();

// Export individual services for more fine-grained usage
export {
  lojaService,
  secaoService,
  perguntaService,
  usuarioService,
  authService,
  auditoriaService,
  respostaService,
  analiseService,
  initDatabase
};
