-- ================================================================
--  ADMAC — CORREÇÃO / NORMALIZAÇÃO DO BANCO (Supabase / PostgreSQL)
--  Arquivo: sql/corrigir_banco_dados.sql
--
--  O que este script faz:
--  1) Garante tabela site_settings, coluna updated_at, trigger e RLS.
--  2) RLS unificado: remove políticas duplicadas/conflitantes e recria uma política permissiva
--     por tabela (anon + painel + site), mais GRANT explícito e storage site-images / admac-fotos.
--  3) Garante publicação Realtime em site_settings (sincronização painel ↔ site).
--  4) REPLICA IDENTITY FULL em site_settings (útil a eventos UPDATE no Realtime).
--  5) Normaliza JSON dos ministérios: bloco "birthdays" compatível com o painel/site.
--  6) Completa chaves comuns em ministry_ebd (info, schedule, team, gallery) sem apagar o que já existe.
--  7) Insere linhas obrigatórias que estejam faltando (ON CONFLICT não sobrescrege dados).
--
--  O que NÃO faz: apagar conteúdo que você já cadastrou no painel.
--
--  Como usar: Supabase → SQL Editor → colar → Run.
--  Pode executar mais de uma vez com segurança (idempotente).
-- ================================================================

-- ----------------------------------------------------------------
-- [1] Tabela e colunas base
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.site_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Garante que data nunca seja NULL
UPDATE public.site_settings SET data = '{}'::jsonb WHERE data IS NULL;

-- ----------------------------------------------------------------
-- [2] Trigger updated_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();

-- ----------------------------------------------------------------
-- [3] RLS — site_settings (painel + site usam chave anon)
--     Remove TODAS as políticas antigas desta tabela e recria uma só,
--     evitando conflitos (vários scripts legados criaram nomes diferentes).
-- ----------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_settings', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admac_site_settings_all"
  ON public.site_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- [4] Realtime + replica identity
-- ----------------------------------------------------------------
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;

-- ----------------------------------------------------------------
-- [5] Normalizar "birthdays" em todos os ministry_* (exceto contato)
--     Defaults à esquerda, dados atuais à direita → seu cadastro prevalece.
-- ----------------------------------------------------------------
UPDATE public.site_settings AS s
SET data = jsonb_set(
  s.data,
  '{birthdays}',
  CASE
    WHEN s.key = 'ministry_casais' THEN
      '{"title":"Aniversários de Casamento","text":"","videoUrl":"","people":[]}'::jsonb
      || COALESCE(s.data->'birthdays', '{}'::jsonb)
    ELSE
      '{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}'::jsonb
      || COALESCE(s.data->'birthdays', '{}'::jsonb)
  END,
  true
)
WHERE s.key ~ '^ministry_'
  AND s.key <> 'ministry_contact';

-- Garante que "people" seja sempre array (corrige null ou tipo errado)
UPDATE public.site_settings AS s
SET data = jsonb_set(
  s.data,
  '{birthdays,people}',
  CASE
    WHEN jsonb_typeof(s.data#>'{birthdays,people}') = 'array'
      THEN s.data#>'{birthdays,people}'
    ELSE '[]'::jsonb
  END,
  true
)
WHERE s.key ~ '^ministry_'
  AND s.key <> 'ministry_contact'
  AND s.data ? 'birthdays';

-- ----------------------------------------------------------------
-- [6] EBD — chaves usadas pela página / painel (merge sem apagar)
-- ----------------------------------------------------------------
UPDATE public.site_settings
SET data = data
  || jsonb_build_object(
    'info', COALESCE(
      NULLIF(data->'info', 'null'::jsonb),
      '{"time":"Domingos, 9h","location":"ADMAC","audience":"Todas as idades"}'::jsonb
    ),
    'schedule', CASE
      WHEN jsonb_typeof(data->'schedule') = 'array' THEN data->'schedule'
      ELSE '[]'::jsonb
    END,
    'team', CASE
      WHEN jsonb_typeof(data->'team') = 'array' THEN data->'team'
      ELSE '[]'::jsonb
    END,
    'gallery', CASE
      WHEN jsonb_typeof(data->'gallery') = 'array' THEN data->'gallery'
      ELSE '[]'::jsonb
    END
  )
WHERE key = 'ministry_ebd';

-- ----------------------------------------------------------------
-- [7] Inserir chaves que faltam (não atualiza se a chave já existir)
-- ----------------------------------------------------------------
INSERT INTO public.site_settings (key, data) VALUES
  ('videos', '[]'::jsonb),
  ('visitor_stats', '{"value":0}'::jsonb),
  ('site_status', '{"online":true,"maintenance":false,"message":""}'::jsonb),
  ('pastors_contacts', '[]'::jsonb),
  ('header', '{"logo":{"text":"ADMAC","icon":"✝"},"menu":[]}'::jsonb),
  ('footer', '{"description":"","verse":"","contact":{}}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, data) VALUES
  ('ministry_kids', '{"hero":{"title":"Ministério Kids","subtitle":"","image":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_louvor', '{"hero":{"title":"Ministério de Louvor","subtitle":"","image":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_jovens', '{"hero":{"title":"Ministério de Jovens","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_mulheres', '{"hero":{"title":"Ministério de Mulheres","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_homens', '{"hero":{"title":"Ministério de Homens","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_lares', '{"hero":{"title":"Ministério de Lares","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_retiro', '{"hero":{"title":"Retiros","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_social', '{"hero":{"title":"Ação Social","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_ebd', '{"hero":{"title":"Escola Bíblica Dominical","subtitle":"Crescendo no conhecimento","image":""},"info":{"time":"Domingos, 9h","location":"ADMAC","audience":"Todas as idades"},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_midia', '{"hero":{"title":"Mídia","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_intercessao', '{"hero":{"title":"Intercessão","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_missoes', '{"hero":{"title":"Missões","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_revista', '{"hero":{"title":"Revista","subtitle":""},"pages":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_casais', '{"hero":{"title":"Ministério de Casais","subtitle":"","image":""},"mission":{"title":"Nossa Missão","text":""},"birthdays":{"title":"Aniversários de Casamento","text":"","videoUrl":"","people":[]}}'::jsonb),
  ('ministry_sobre', '{"hero":{"title":"Sobre","subtitle":"","image":""},"mission":{"title":"","text":""}}'::jsonb),
  ('ministry_contact', '{"title":"Contato","description":"","address":"","phone":"","email":""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Após INSERT acima, ainda normaliza birthdays nas linhas recém-criadas
UPDATE public.site_settings AS s
SET data = jsonb_set(
  s.data,
  '{birthdays}',
  CASE
    WHEN s.key = 'ministry_casais' THEN
      '{"title":"Aniversários de Casamento","text":"","videoUrl":"","people":[]}'::jsonb
      || COALESCE(s.data->'birthdays', '{}'::jsonb)
    ELSE
      '{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}'::jsonb
      || COALESCE(s.data->'birthdays', '{}'::jsonb)
  END,
  true
)
WHERE s.key ~ '^ministry_'
  AND s.key <> 'ministry_contact'
  AND s.data ? 'birthdays';

-- ----------------------------------------------------------------
-- [8] Tabelas auxiliares do painel (mínimo para não quebrar o app)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  password   TEXT        NOT NULL DEFAULT '',
  role       TEXT        DEFAULT 'Viewer',
  status     TEXT        DEFAULT 'active',
  location   TEXT        DEFAULT '',
  photo      TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_users', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admac_site_users_all"
  ON public.site_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO public.site_users (name, email, password, role, status, location)
VALUES ('Administrador', 'admin@admin.com', 'REDACTED_SENHA', 'Administrador', 'active', '')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.site_logs (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     TEXT        NOT NULL,
  user_email TEXT        DEFAULT '',
  details    TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_logs', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admac_site_logs_all"
  ON public.site_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.site_messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL DEFAULT '',
  email      TEXT        NOT NULL DEFAULT '',
  phone      TEXT        DEFAULT '',
  message    TEXT        NOT NULL DEFAULT '',
  read       BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.site_messages', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admac_site_messages_all"
  ON public.site_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- [9] Permissões nas tabelas (complementa RLS; evita 42501 em alguns projetos)
-- ----------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_logs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_messages TO anon, authenticated;

-- ----------------------------------------------------------------
-- [10] Storage — buckets e RLS (upload do painel: site-images; SQL legado: admac-fotos)
--     Não altera buckets desconhecidos; só garante estes dois.
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site-images', 'site-images', true, 52428800,
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']::text[]),
  ('admac-fotos', 'admac-fotos', true, 52428800,
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']::text[])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "st_fotos_livre" ON storage.objects;
DROP POLICY IF EXISTS "Gestão de Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Acesso Público de Leitura" ON storage.objects;
DROP POLICY IF EXISTS "admac_storage_site_images" ON storage.objects;
DROP POLICY IF EXISTS "admac_storage_admac_fotos" ON storage.objects;

CREATE POLICY "admac_storage_site_images"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "admac_storage_admac_fotos"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'admac-fotos')
  WITH CHECK (bucket_id = 'admac-fotos');

-- ----------------------------------------------------------------
-- Log de auditoria
-- ----------------------------------------------------------------
INSERT INTO public.site_logs (action, user_email, details)
VALUES ('DB_FIX', 'sistema', 'Script sql/corrigir_banco_dados.sql — RLS unificado, GRANTs e storage site-images/admac-fotos.');

-- Fim
SELECT 'Correção concluída (RLS + GRANTs + storage). Teste o painel e o site.' AS resultado;
