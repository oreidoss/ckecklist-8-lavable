# Migrar o app para o banco de dados interno do Lovable

O app hoje usa um projeto Supabase externo, com login por nome/senha guardada em texto na tabela `usuarios`. Vamos passar tudo para o banco interno (Lovable Cloud), manter exatamente as mesmas telas e funcionalidades, migrar todos os dados e trocar o login por contas reais (e-mail/senha sem confirmação + entrar com Google).

## O que será feito

### 1. Ativar o banco interno
Ativo o Lovable Cloud neste projeto. A partir daí o app passa a apontar para o banco novo, e o Supabase externo deixa de ser usado (nada é apagado lá — fica como backup).

### 2. Criar as tabelas
Mesmo desenho de hoje, sem mudança de nomes ou colunas, para o app continuar igual:

- `lojas` (numero, nome)
- `secoes` (nome)
- `perguntas` (secao_id, texto)
- `auditorias` (loja_id, usuario_id, data, supervisor, gerente, pontuacao_total, status, assinaturas)
- `respostas` (auditoria_id, pergunta_id, resposta, pontuacao_obtida, observacao, anexo_url)
- `usuarios` (perfil: nome, e-mail, função) — agora ligado à conta de login
- `user_roles` (tabela separada de papéis: admin / user) — necessária para o acesso às telas de administração ser verificado no servidor, e não no navegador

Todas com as permissões e regras de acesso corretas: qualquer usuário logado lê e grava os dados do checklist; só quem for admin altera lojas, seções, perguntas e usuários.

### 3. Migrar todos os dados
Copio 100% dos registros existentes (lojas, seções, perguntas, auditorias, respostas e os cadastros de usuários) mantendo os mesmos IDs, para que auditorias e relatórios antigos continuem intactos.

Observação sobre os usuários: os perfis são migrados, mas as senhas atuais não vão junto (elas ficarão em um sistema de login de verdade). Na primeira entrada, cada pessoa cria a conta com o mesmo e-mail — o perfil e o histórico se conectam automaticamente pelo e-mail.

### 4. Novo login
- Tela de login/cadastro com e-mail e senha, **sem confirmação de e-mail** (entra direto após criar a conta)
- Botão **Entrar com Google**
- Sessão persistente: o usuário continua logado ao recarregar a página
- O primeiro acesso cria automaticamente o perfil em `usuarios`; quem já existia pelo e-mail é reaproveitado, inclusive com a função de admin
- Ação necessária de sua parte: para o Google funcionar é preciso ativar o provedor Google no backend e informar o Client ID/Secret do Google Cloud. Eu deixo tudo pronto e te aviso onde colar.

### 5. Adaptar o código
- Cliente do banco apontando para o projeto interno
- `AuthContext`, `ProtectedRoute` e a tela de Login usando a autenticação real (e `isAdmin` vindo de `user_roles`)
- Os serviços (`lojaService`, `secaoService`, `perguntaService`, `usuarioService`, `auditoriaService`, `respostaService`) passam a usar o novo cliente; toda a lógica de checklist, pontuação, relatórios e PDF fica igual
- Removo os restos de "fallback no localStorage" do login antigo

### 6. Ficou de fora (combinado)
Envio de relatório por e-mail (a função `send-report-email`) fica desativado por enquanto; o PDF continua sendo gerado e baixado normalmente. Recriamos depois quando quiser.

## Detalhes técnicos

- Schema criado via migração Drizzle no banco Cloud, com `GRANT` + RLS em cada tabela.
- Papéis em tabela própria `user_roles` + função `has_role(uuid, app_role)` `security definer`, usada nas policies (evita escalonamento de privilégio e recursão de RLS).
- `usuarios.user_id` referenciando `auth.users`, preenchido por trigger `handle_new_user` no cadastro; se já houver linha com o mesmo e-mail, ela é vinculada em vez de duplicada.
- Migração de dados: leitura do projeto atual e reinserção com IDs preservados, na ordem lojas → secoes → perguntas → usuarios → auditorias → respostas.
- Google OAuth: redirect/callback configurado para as URLs de preview e publicada; `emailRedirectTo` definido no signup.

## Verificação

Testo no preview: criar conta, entrar com e-mail/senha, listar lojas, abrir um checklist antigo com as respostas salvas, salvar uma resposta nova, ver as porcentagens por seção e abrir um relatório.
