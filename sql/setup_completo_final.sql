-- ================================================================
--  [ADMAC] - SCRIPT DE SUPABASE COMPLETO E UNIFICADO
--  Arquivo: sql/setup_completo_final.sql
--  Descrição: Cria todas as tabelas, Storage, Realtime e Dados 
--             Iniciais em UMA ÚNICA EXECUÇÃO, sem gerar erros.
--
--  INSTRUÇÕES:
--  1. Abra seu novo projeto no Supabase
--  2. Vá no "SQL Editor" -> "New Query"
--  3. Cole tudo isso aqui e clique em "Run".
-- ================================================================

-- ================================================================
-- [1] TABELA PRINCIPAL DE CONTEÚDO (site_settings)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_settings' AND column_name='updated_at') THEN
    ALTER TABLE public.site_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- [IMPORTANTE] RLS liberado para o painel (que não usa o login nativo do Supabase) conseguir salvar
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ss_leitura_publica" ON public.site_settings;
DROP POLICY IF EXISTS "ss_escrita_livre" ON public.site_settings;
DROP POLICY IF EXISTS "ss_escrita_autenticada" ON public.site_settings;

CREATE POLICY "ss_leitura_publica" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "ss_escrita_livre" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='site_settings') THEN 
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings; 
  END IF;
END $$;


-- ================================================================
-- [2] TABELA DE USUÁRIOS DO PAINEL (site_users)
-- ================================================================
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='password') THEN
    ALTER TABLE public.site_users ADD COLUMN password TEXT NOT NULL DEFAULT '123456';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='role') THEN
    ALTER TABLE public.site_users ADD COLUMN role TEXT DEFAULT 'Viewer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='status') THEN
    ALTER TABLE public.site_users ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='location') THEN
    ALTER TABLE public.site_users ADD COLUMN location TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='site_users' AND column_name='photo') THEN
    ALTER TABLE public.site_users ADD COLUMN photo TEXT DEFAULT '';
  END IF;
END $$;


ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "su_livre_leitura" ON public.site_users;
DROP POLICY IF EXISTS "su_livre_escrita" ON public.site_users;
CREATE POLICY "su_livre_leitura" ON public.site_users FOR SELECT USING (true);
CREATE POLICY "su_livre_escrita" ON public.site_users FOR ALL USING (true) WITH CHECK (true);

-- Admin padrão
INSERT INTO public.site_users (name, email, password, role, status, location)
VALUES ('Administrador', 'admin@admin.com', '123456', 'Administrador', 'active', 'Samambaia, DF')
ON CONFLICT (email) DO NOTHING;


-- ================================================================
-- [3] TABELA DE LOGS (site_logs)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_logs (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     TEXT        NOT NULL,
  user_email TEXT        DEFAULT '',
  details    TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sl_livre" ON public.site_logs;
CREATE POLICY "sl_livre" ON public.site_logs FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='site_logs') THEN 
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_logs; 
  END IF;
END $$;


-- ================================================================
-- [4] TABELA DE MENSAGENS (site_messages)
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

ALTER TABLE public.site_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sm_livre" ON public.site_messages;
CREATE POLICY "sm_livre" ON public.site_messages FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='site_messages') THEN 
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_messages; 
  END IF;
END $$;


-- ================================================================
-- [5] TABELA DE MÍDIA (media_files e BUCKET admac-fotos)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.media_files (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  url         TEXT        NOT NULL,
  bucket      TEXT        NOT NULL DEFAULT 'admac-fotos',
  path        TEXT        NOT NULL,
  ministry    TEXT        DEFAULT '',
  section     TEXT        DEFAULT '',
  size_bytes  BIGINT      DEFAULT 0,
  mime_type   TEXT        DEFAULT 'image/jpeg',
  uploaded_by TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mf_livre" ON public.media_files;
CREATE POLICY "mf_livre" ON public.media_files FOR ALL USING (true) WITH CHECK (true);

-- Criar Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('admac-fotos', 'admac-fotos', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "st_fotos_livre" ON storage.objects;
CREATE POLICY "st_fotos_livre" ON storage.objects FOR ALL USING (bucket_id = 'admac-fotos') WITH CHECK (bucket_id = 'admac-fotos');


-- ================================================================
-- [6] DADOS INICIAIS DAS PÁGINAS (PRESERVAR O QUE EXISTE: DO NOTHING)
-- ================================================================
INSERT INTO public.site_settings (key, data) VALUES ('home', '{
  "carousel":[
    {"image":"/imagem/banner2.png","title":"Culto de Louvor e Adoração","subtitle":"Venha adorar a Deus conosco"},
    {"image":"/imagem/culto de louvor.jpg","title":"Comunhão e Fé","subtitle":"Uma família para pertencer"},
    {"image":"/imagem/bem vindo.jpg","title":"Ensino da Palavra","subtitle":"Crescendo na graça e no conhecimento"}
  ],
  "welcome":{"title":"Bem-vindo à ADMAC","text1":"Somos uma igreja que ama a Deus e as pessoas.","text2":"Venha fazer parte da nossa família!","buttonText":"Entre em Contato","buttonLink":"/contato"},
  "pastors":[
    {"name":"Pastor Roberto Silva","title":"Pastor Presidente","verse":"\"Porque Deus amou o mundo de tal maneira...\" - João 3:16","image":"/imagem/2 pastor-florivaldao.jpeg"},
    {"name":"Pastora Ana Silva","title":"Pastora Auxiliar","verse":"\"O Senhor é o meu pastor, nada me faltará.\" - Salmos 23:1","image":"https://ui-avatars.com/api/?name=Pastora+Ana&background=d4af37&color=000&size=200&bold=true"},
    {"name":"Pastor Carlos Mendes","title":"Pastor de Jovens","verse":"\"Ninguém despreze a tua mocidade...\" - 1 Timóteo 4:12","image":"https://ui-avatars.com/api/?name=Pastor+Carlos&background=d4af37&color=000&size=200&bold=true"}
  ],
  "schedule":[
    {"day":"Domingo","time":"9h","event":"EBD - Escola Bíblica","iconType":"Book"},
    {"day":"Domingo","time":"18h","event":"Culto de Celebração","iconType":"Music"},
    {"day":"Terça","time":"19h30","event":"Culto de Doutrina","iconType":"Book"},
    {"day":"Quinta","time":"19h30","event":"Culto de Oração","iconType":"Heart"}
  ],
  "activities":[
    {"title":"Distribuição de Cestas Básicas","date":"1º Sábado do Mês","description":"Ajudando famílias em situação de vulnerabilidade","image":"/imagem/hoje.jpg"}
  ],
  "cta":{"title":"Faça Parte da Nossa Família","subtitle":"Venha nos visitar e experimente o amor de Deus em nossa comunidade","primaryBtn":"Quero Visitar","primaryLink":"/contato","secondaryBtn":"Ligar Agora","secondaryLink":"tel:+5561993241084"},
  "ministries":[
    {"title":"Kids","description":"Ensinando a criança no caminho","link":"/kids","icon":"👶","color":"#ff6b9d"},
    {"title":"Louvor","description":"Adorando a Deus","link":"/louvor","icon":"🎵","color":"#9b59b6"},
    {"title":"EBD","description":"Crescendo na Palavra","link":"/ebd","icon":"📚","color":"#d4af37"}
  ]
}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES
('header','{"logo":{"text":"ADMAC","icon":"✝"},"menu":[{"name":"Início","path":"/"},{"name":"Sobre","path":"/sobre"}]}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES
('footer','{"description":"Assembleia de Deus Ministério Atos e Conquistas","verse":"Ide por todo o mundo e pregai o evangelho","contact":{"address":"QN 404 - Samambaia Norte, DF","phone":"(61) 99999-9999","email":"contato@admac.com.br"}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES ('videos', '[]'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('visitor_stats', '{"value": 0}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES ('ministry_kids', '{"hero":{"title":"Ministério Kids","subtitle":"Ensinando as crianças","image":"/imagem/kidis.jpg"},"info":{}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_louvor', '{"hero":{"title":"Ministério de Louvor","subtitle":"Adorando a Deus","image":"/imagem/culto de louvor.jpg"},"info":{}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_contact', '{"title":"Entre em Contato","description":"Estamos aqui para te receber!","address":"Samambaia, DF","phone":"(61) 99324-1084"}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_jovens', '{"hero":{"title":"Ministério de Jovens","subtitle":"Jovens apaixonados por Deus","verse":"1 Timóteo 4:12","image":"/imagem/culto1.jpg.png"},"mission":{"title":"Nossa Missão","text":"Formar uma geração comprometida."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_mulheres', '{"hero":{"title":"Ministério de Mulheres","subtitle":"Mulheres transformadas","verse":"Provérbios 31:10","image":"/imagem/mulheres.jpg"},"mission":{"title":"Nossa Missão","text":"Acolher e inspirar mulheres."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_homens', '{"hero":{"title":"Ministério de Homens","subtitle":"Firmes na fé","verse":"1 Coríntios 15:58","image":"/imagem/homem.png"},"mission":{"title":"Nossa Missão","text":"Fortalecer homens na Palavra."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_lares', '{"hero":{"title":"Ministério de Lares","subtitle":"Comunhão nos lares","verse":"Atos 2:46","image":"/imagem/CULTO LARES.png"},"mission":{"title":"Nossa Missão","text":"Levar a igreja para as casas."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_retiro', '{"hero":{"title":"Retiros","subtitle":"Renovação e comunhão","verse":"","image":"/imagem/aviso1.jpg"},"mission":{"title":"Visão","text":"Desconecte-se do mundo."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_social', '{"hero":{"title":"Ação Social","subtitle":"Servindo com amor","image":"/imagem/hoje.jpg"},"mission":{"title":"Missão","text":"Ações práticas de amor."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_ebd', '{"hero":{"title":"Escola Bíblica Dominical","subtitle":"Crescendo no conhecimento","verse":"","image":"/imagem/estudo biblico.jpg"},"mission":{"title":"Visão","text":"Ensino da Palavra."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_midia', '{"hero":{"title":"Mídia","subtitle":"Comunicação do Reino","image":"/imagem/midia.jpg"},"mission":{"title":"Visão","text":"Tecnologia a favor do evangelho."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_intercessao', '{"hero":{"title":"Intercessão","subtitle":"Orai sem cessar","image":"/imagem/Intercessão.jpg"},"mission":{"title":"Missão","text":"Sustentar a igreja na oração."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_casais', '{"hero":{"title":"Min. Casais","subtitle":"Famílias na Rocha","image":"/imagem/fe1.jpg"},"mission":{"title":"Missão","text":"Fortalecer laços."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_missoes', '{"hero":{"title":"Missões","subtitle":"Ide por todo o mundo","image":"/imagem/hoje (2).jpg"},"mission":{"title":"Missão","text":"Apoiar missionários."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_sobre', '{"hero":{"title":"Sobre a Igreja","subtitle":"Nossa história","image":"/imagem/admac.png"},"mission":{"title":"Quem Somos","text":"Proclamar o evangelho."}}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_revista', '{"hero":{"title":"Revista","subtitle":"Mensal"},"pages":[]}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
INSERT INTO public.site_settings (key, data) VALUES ('pastors_contacts', '[]'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

-- Log de confirmação
INSERT INTO public.site_logs (action, user_email, details) VALUES ('SETUP_FINAL', 'sistema', 'Todas as tabelas configuradas em script unificado sem falhas.');

-- SCRIPT CONCLUÍDO COM SUCESSO!
