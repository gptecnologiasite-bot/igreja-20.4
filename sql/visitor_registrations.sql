-- ================================================================
-- visitor_registrations.sql — Cadastro de visitantes ("Quero Visitar")
-- ----------------------------------------------------------------
-- Aditivo: cria SOMENTE uma tabela nova. Não altera tabelas existentes.
-- Rode este script no SQL Editor do Supabase (uma única vez).
-- Segue o mesmo padrão de permissões de public.site_messages.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.visitor_registrations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL DEFAULT '',
  phone       TEXT        DEFAULT '',
  email       TEXT        DEFAULT '',
  neighborhood TEXT       DEFAULT '',
  age_range   TEXT        DEFAULT '',
  how_knew    TEXT        DEFAULT '',
  interest    TEXT        DEFAULT '',
  visit_date  DATE,
  message     TEXT        DEFAULT '',
  answers     JSONB       DEFAULT '{}'::jsonb,
  link        TEXT        DEFAULT '',
  status      TEXT        DEFAULT 'novo',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.visitor_registrations ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitor_registrations'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.visitor_registrations', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admac_visitor_registrations_all"
  ON public.visitor_registrations
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_registrations TO anon, authenticated;

-- Índice simples para ordenar a listagem do painel por data.
CREATE INDEX IF NOT EXISTS idx_visitor_registrations_created_at
  ON public.visitor_registrations (created_at DESC);
