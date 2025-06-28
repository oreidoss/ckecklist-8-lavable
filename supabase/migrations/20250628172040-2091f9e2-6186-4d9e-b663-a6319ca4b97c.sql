
-- Adicionar campos para armazenar assinaturas digitais na tabela auditorias
ALTER TABLE public.auditorias 
ADD COLUMN assinatura_gerente TEXT,
ADD COLUMN assinatura_supervisor TEXT;
