-- ================================================================
--  ADMAC - SQL DO PAINEL ADMIN
--  Arquivo: sql/painel_tabelas.sql
--  Tabelas usadas pelo painel: site_users, site_logs, site_messages
--  Execute no Supabase: SQL Editor → New query → Cole → Run
-- ================================================================

-- ================================================================
-- [1] TABELA DE USUÁRIOS DO PAINEL (site_users)
--     Usada por: loadUsers, saveUser, deleteUser, login
--     Colunas: id, name, email, password, role, status, location, photo, created_at
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  password   TEXT        NOT NULL DEFAULT '',
  role       TEXT        DEFAULT 'Viewer',
  status     TEXT        DEFAULT 'active',   -- 'active' | 'pending' | 'blocked'
  location   TEXT        DEFAULT '',
  photo      TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona colunas que podem faltar (seguro rodar de novo)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='photo')
    THEN ALTER TABLE public.site_users ADD COLUMN photo TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='location')
    THEN ALTER TABLE public.site_users ADD COLUMN location TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='status')
    THEN ALTER TABLE public.site_users ADD COLUMN status TEXT DEFAULT 'active'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='role')
    THEN ALTER TABLE public.site_users ADD COLUMN role TEXT DEFAULT 'Viewer'; END IF;
END $$;

-- Segurança RLS
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "su_leitura_auth"  ON public.site_users;
DROP POLICY IF EXISTS "su_escrita_auth"  ON public.site_users;
DROP POLICY IF EXISTS "su_registro_pub"  ON public.site_users;

-- Somente admins autenticados podem ler e editar usuários
CREATE POLICY "su_leitura_auth" ON public.site_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "su_escrita_auth" ON public.site_users
  FOR ALL USING (auth.role() = 'authenticated');

-- Usuário admin padrão (senha: 123456) — não altera se já existir
INSERT INTO public.site_users (name, email, password, role, status, location)
VALUES ('Administrador', 'admin@admin.com', '123456', 'Administrador', 'active', 'Samambaia, DF')
ON CONFLICT (email) DO NOTHING;


-- ================================================================
-- [2] TABELA DE LOGS DO PAINEL (site_logs)
--     Usada por: login, logout, saveMinistry, visitor tracker
--     Colunas: id, action, user_email, details, created_at
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_logs (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     TEXT        NOT NULL,           -- ex: LOGIN_SISTEMA, LOGOUT_SISTEMA, visitor_access
  user_email TEXT        DEFAULT '',         -- e-mail do usuário que fez a ação (ou localização do visitante)
  details    TEXT        DEFAULT '',         -- descrição detalhada da ação
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona colunas que podem faltar
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_logs' AND column_name='details')
    THEN ALTER TABLE public.site_logs ADD COLUMN details TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_logs' AND column_name='user_email')
    THEN ALTER TABLE public.site_logs ADD COLUMN user_email TEXT DEFAULT ''; END IF;
END $$;

-- Segurança RLS
ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sl_leitura_auth"  ON public.site_logs;
DROP POLICY IF EXISTS "sl_insere_todos"  ON public.site_logs;

-- Somente admins leem os logs
CREATE POLICY "sl_leitura_auth" ON public.site_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Qualquer um pode inserir log (para rastrear visitantes anônimos também)
CREATE POLICY "sl_insere_todos" ON public.site_logs
  FOR INSERT WITH CHECK (true);

-- Realtime para o painel ver logs ao vivo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_logs'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.site_logs; END IF;
END $$;

-- Log inicial para confirmar que o script foi executado
INSERT INTO public.site_logs (action, user_email, details)
VALUES ('SETUP_SCRIPT', 'sistema', 'Tabelas do painel criadas/atualizadas via SQL.')
ON CONFLICT DO NOTHING;


-- ================================================================
-- [3] TABELA DE MENSAGENS DE CONTATO (site_messages)
--     Usada por: formulário de contato → painel → aba Mensagens
--     Colunas: id, name, email, phone, message, read, created_at
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL DEFAULT '',
  email      TEXT        NOT NULL DEFAULT '',
  phone      TEXT        DEFAULT '',
  message    TEXT        NOT NULL DEFAULT '',
  read       BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona colunas que podem faltar
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_messages' AND column_name='phone')
    THEN ALTER TABLE public.site_messages ADD COLUMN phone TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_messages' AND column_name='read')
    THEN ALTER TABLE public.site_messages ADD COLUMN read BOOLEAN DEFAULT false; END IF;
END $$;

-- Segurança RLS
ALTER TABLE public.site_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sm_insere_pub"    ON public.site_messages;
DROP POLICY IF EXISTS "sm_leitura_auth"  ON public.site_messages;
DROP POLICY IF EXISTS "sm_update_auth"   ON public.site_messages;

-- Qualquer visitante pode enviar mensagem pelo formulário de contato
CREATE POLICY "sm_insere_pub" ON public.site_messages
  FOR INSERT WITH CHECK (true);

-- Somente admins leem as mensagens no painel
CREATE POLICY "sm_leitura_auth" ON public.site_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Somente admins marcam como lida
CREATE POLICY "sm_update_auth" ON public.site_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Realtime para novas mensagens aparecerem no painel automaticamente
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_messages'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.site_messages; END IF;
END $$;


-- ================================================================
-- [4] CHAVES EXTRAS NO site_settings USADAS PELO PAINEL
-- ================================================================

-- Contador de visitantes (incrementado pelo visitor tracker)
INSERT INTO public.site_settings (key, data)
VALUES ('visitor_stats', '{"value": 0}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Último visitante registrado
INSERT INTO public.site_settings (key, data)
VALUES ('last_visit', '{"location":"","city":"","region":"","country":"","timestamp":0}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Configuração do menu de navegação do painel
INSERT INTO public.site_settings (key, data)
VALUES ('painel_nav', '{
  "main": [
    {"id":"dashboard","label":"Dashboard","icon":"📊"},
    {"id":"conteudo","label":"Conteúdo","icon":"📝"},
    {"id":"mensagens","label":"Mensagens","icon":"💬"},
    {"id":"paginas","label":"Páginas","icon":"📄"}
  ],
  "settings": [
    {"id":"configuracoes","label":"Configurações","icon":"⚙️"},
    {"id":"membros","label":"Membros","icon":"👥"},
    {"id":"relatorios","label":"Relatórios","icon":"📊"}
  ]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ================================================================
-- VERIFICAÇÃO FINAL — mostra tudo que foi criado
-- ================================================================
SELECT
  table_name AS tabela,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name
  )::TEXT AS colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('site_users','site_logs','site_messages','site_settings')
ORDER BY table_name;

-- Contagem dos registros
SELECT '👤 site_users'    AS tabela, COUNT(*)::TEXT AS total FROM public.site_users
UNION ALL
SELECT '📋 site_logs',               COUNT(*)::TEXT          FROM public.site_logs
UNION ALL
SELECT '💬 site_messages',           COUNT(*)::TEXT          FROM public.site_messages
UNION ALL
SELECT '⚙️  site_settings (painel)', COUNT(*)::TEXT
  FROM public.site_settings
  WHERE key IN ('visitor_stats','last_visit','painel_nav');

-- ================================================================
-- FIM — sql/painel_tabelas.sql
--
-- TABELAS CRIADAS:
--   site_users    → usuários do painel (login, edição, permissões)
--   site_logs     → histórico de ações (login, logout, visitantes)
--   site_messages → mensagens do formulário de contato
--
-- CHAVES ADICIONADAS AO site_settings:
--   visitor_stats → contador de visitantes
--   last_visit    → dados do último visitante
--   painel_nav    → configuração do menu do painel
-- ================================================================
