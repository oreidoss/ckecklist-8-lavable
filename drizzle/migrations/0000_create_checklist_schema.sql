-- Papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Usuarios (perfis)
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  funcao text DEFAULT 'user',
  user_id uuid
);
CREATE UNIQUE INDEX usuarios_user_id_key ON public.usuarios (user_id) WHERE user_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read usuarios" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert usuarios" ON public.usuarios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own profile" ON public.usuarios FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete usuarios" ON public.usuarios FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Lojas
CREATE TABLE public.lojas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  numero text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lojas TO authenticated;
GRANT ALL ON public.lojas TO service_role;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage lojas" ON public.lojas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Secoes
CREATE TABLE public.secoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secoes TO authenticated;
GRANT ALL ON public.secoes TO service_role;
ALTER TABLE public.secoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage secoes" ON public.secoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Perguntas
CREATE TABLE public.perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secao_id uuid REFERENCES public.secoes(id) ON DELETE CASCADE,
  texto text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perguntas TO authenticated;
GRANT ALL ON public.perguntas TO service_role;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage perguntas" ON public.perguntas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auditorias
CREATE TABLE public.auditorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid REFERENCES public.lojas(id) ON DELETE SET NULL,
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  data timestamptz DEFAULT now(),
  status text DEFAULT 'em_andamento',
  pontuacao_total numeric DEFAULT 0,
  gerente text,
  supervisor text,
  assinatura_gerente text,
  assinatura_supervisor text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auditorias TO authenticated;
GRANT ALL ON public.auditorias TO service_role;
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage auditorias" ON public.auditorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Respostas
CREATE TABLE public.respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id uuid REFERENCES public.auditorias(id) ON DELETE CASCADE,
  pergunta_id uuid REFERENCES public.perguntas(id) ON DELETE CASCADE,
  resposta text,
  pontuacao_obtida numeric,
  observacao text,
  anexo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.respostas TO authenticated;
GRANT ALL ON public.respostas TO service_role;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage respostas" ON public.respostas FOR ALL TO authenticated USING (true) WITH CHECK (true);
