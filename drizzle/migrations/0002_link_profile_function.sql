CREATE OR REPLACE FUNCTION public.link_profile_to_auth_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_funcao text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.usuarios
     SET user_id = v_uid
   WHERE user_id IS NULL
     AND lower(email) = lower(v_email);

  SELECT funcao INTO v_funcao FROM public.usuarios WHERE user_id = v_uid LIMIT 1;

  IF v_funcao = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_profile_to_auth_user() TO authenticated;