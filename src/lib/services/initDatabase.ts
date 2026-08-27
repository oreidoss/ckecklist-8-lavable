/**
 * Legacy no-op: usuários agora são criados pelo fluxo de autenticação
 * (e-mail/senha ou Google) e vinculados ao perfil em `usuarios`.
 */
export const initDatabase = async () => {
  return;
};
