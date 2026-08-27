-- Execute este SQL no SQL Editor do Supabase deste projeto (uma única vez).
-- Ele cria a tabela de papéis (admin/user), liga os perfis existentes às contas de login
-- e substitui as políticas "acesso público" por políticas para usuários autenticados.

-- 1. Papéis
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
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

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Ligar perfis (usuarios) às contas de login
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_user_id_key ON public.usuarios (user_id) WHERE user_id IS NOT NULL;

-- 3. Criar/ligar perfil e papel no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing public.usuarios%ROWTYPE;
  display_name text;
BEGIN
  display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'nome',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  SELECT * INTO existing FROM public.usuarios WHERE lower(email) = lower(NEW.email) LIMIT 1;

  IF existing.id IS NOT NULL THEN
    UPDATE public.usuarios SET user_id = NEW.id WHERE id = existing.id;
  ELSE
    INSERT INTO public.usuarios (nome, email, funcao, user_id)
    VALUES (display_name, NEW.email, 'user', NEW.id);
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN existing.funcao = 'admin' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Políticas: somente usuários autenticados
DROP POLICY IF EXISTS "Allow public access to lojas" ON public.lojas;
DROP POLICY IF EXISTS "Allow public access to secoes" ON public.secoes;
DROP POLICY IF EXISTS "Allow public access to perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Allow public access to auditorias" ON public.auditorias;
DROP POLICY IF EXISTS "Allow public access to respostas" ON public.respostas;
DROP POLICY IF EXISTS "Allow public access to usuarios" ON public.usuarios;

REVOKE ALL ON public.lojas, public.secoes, public.perguntas, public.auditorias, public.respostas, public.usuarios FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lojas, public.secoes, public.perguntas, public.auditorias, public.respostas, public.usuarios TO authenticated;
GRANT ALL ON public.lojas, public.secoes, public.perguntas, public.auditorias, public.respostas, public.usuarios TO service_role;

CREATE POLICY "Authenticated read lojas" ON public.lojas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage lojas" ON public.lojas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated read secoes" ON public.secoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage secoes" ON public.secoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated read perguntas" ON public.perguntas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage perguntas" ON public.perguntas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated manage auditorias" ON public.auditorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage respostas" ON public.respostas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read usuarios" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.usuarios FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage usuarios" ON public.usuarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
