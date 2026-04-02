-- ================================================================
-- ADMAC - SQL COMPLETO
-- Tabelas: site_settings + painel_users + media_files
-- Storage: bucket "admac-fotos" para upload de imagens
-- Execute no Supabase: SQL Editor → New query → Run
-- ================================================================


-- ================================================================
-- PARTE 1: TABELA PRINCIPAL DE CONTEÚDO (pages + painel)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coluna updated_at (adiciona se faltar)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.site_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Atualiza updated_at automaticamente ao salvar
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Segurança (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública"     ON public.site_settings;
DROP POLICY IF EXISTS "Escrita autenticada" ON public.site_settings;

CREATE POLICY "Leitura pública" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Escrita autenticada" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Realtime (atualizações ao vivo no site)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;


-- ================================================================
-- PARTE 2: TABELA DE USUÁRIOS DO PAINEL
-- ================================================================
CREATE TABLE IF NOT EXISTS public.painel_users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  password   TEXT        NOT NULL,
  role       TEXT        DEFAULT 'Viewer',
  status     TEXT        DEFAULT 'active',
  photo      TEXT        DEFAULT '',
  location   TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona colunas faltando (seguro para rodar de novo)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='painel_users' AND column_name='photo')
    THEN ALTER TABLE public.painel_users ADD COLUMN photo TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='painel_users' AND column_name='location')
    THEN ALTER TABLE public.painel_users ADD COLUMN location TEXT DEFAULT ''; END IF;
END $$;

-- Segurança
ALTER TABLE public.painel_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin gerencia usuários" ON public.painel_users;
CREATE POLICY "Admin gerencia usuários" ON public.painel_users
  FOR ALL USING (auth.role() = 'authenticated');

-- Usuário admin padrão
INSERT INTO public.painel_users (name, email, password, role, status, location)
VALUES ('Administrador', 'admin@admin.com', '123456', 'Administrador', 'active', 'Samambaia, DF')
ON CONFLICT (email) DO NOTHING;


-- ================================================================
-- PARTE 3: TABELA DE FOTOS / MÍDIA
-- Registra todas as fotos enviadas pelo painel
-- ================================================================
CREATE TABLE IF NOT EXISTS public.media_files (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  url         TEXT        NOT NULL,
  bucket      TEXT        NOT NULL DEFAULT 'admac-fotos',
  path        TEXT        NOT NULL,
  ministry    TEXT        DEFAULT '',   -- ex: kids, louvor, home
  section     TEXT        DEFAULT '',   -- ex: gallery, carousel, team
  size_bytes  BIGINT      DEFAULT 0,
  mime_type   TEXT        DEFAULT 'image/jpeg',
  uploaded_by TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Segurança
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de fotos"     ON public.media_files;
DROP POLICY IF EXISTS "Upload apenas autenticados"   ON public.media_files;

CREATE POLICY "Leitura pública de fotos" ON public.media_files
  FOR SELECT USING (true);
CREATE POLICY "Upload apenas autenticados" ON public.media_files
  FOR ALL USING (auth.role() = 'authenticated');

-- Realtime para o gerenciador de fotos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'media_files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.media_files;
  END IF;
END $$;


-- ================================================================
-- PARTE 4: STORAGE BUCKET PARA FOTOS
-- Cria o bucket "admac-fotos" para upload via painel
-- ================================================================

-- Cria o bucket (ignora se já existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admac-fotos',
  'admac-fotos',
  true,                          -- público (qualquer um pode ver as fotos)
  10485760,                      -- limite: 10 MB por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public           = true,
  file_size_limit  = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Políticas do Storage
DROP POLICY IF EXISTS "Fotos públicas para leitura"   ON storage.objects;
DROP POLICY IF EXISTS "Upload autenticado de fotos"   ON storage.objects;
DROP POLICY IF EXISTS "Deletar fotos autenticado"     ON storage.objects;
DROP POLICY IF EXISTS "Atualizar fotos autenticado"   ON storage.objects;

-- Qualquer um pode VER as fotos
CREATE POLICY "Fotos públicas para leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'admac-fotos');

-- Apenas admins podem ENVIAR fotos
CREATE POLICY "Upload autenticado de fotos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'admac-fotos'
    AND auth.role() = 'authenticated'
  );

-- Apenas admins podem DELETAR fotos
CREATE POLICY "Deletar fotos autenticado" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'admac-fotos'
    AND auth.role() = 'authenticated'
  );

-- Apenas admins podem ATUALIZAR fotos
CREATE POLICY "Atualizar fotos autenticado" ON storage.objects
  FOR UPDATE WITH CHECK (
    bucket_id = 'admac-fotos'
    AND auth.role() = 'authenticated'
  );


-- ================================================================
-- PARTE 5: DADOS INICIAIS DO SITE
-- ================================================================

-- HOME (Carousel + Boas-Vindas)
INSERT INTO public.site_settings (key, data) VALUES ('home', '{
  "carousel": [
    {"image":"https://images.unsplash.com/photo-1510936111840-65e151ad71bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Culto de Louvor e Adoração","subtitle":"Venha adorar a Deus conosco"},
    {"image":"https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Comunhão e Fé","subtitle":"Uma família para pertencer"},
    {"image":"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Ensino da Palavra","subtitle":"Crescendo na graça e no conhecimento"}
  ],
  "welcome": {
    "title":"Bem-vindo à ADMAC",
    "text1":"Somos uma igreja que ama a Deus e as pessoas. Nossa missão é proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus.",
    "text2":"Venha fazer parte da nossa família! Aqui você encontrará um lugar de acolhimento, crescimento espiritual e comunhão genuína.",
    "buttonText":"Entre em Contato",
    "buttonLink":"/contato"
  },
  "pastors": [
    {"name":"Pastor Roberto Silva","title":"Pastor Presidente","verse":"\"Porque Deus amou o mundo de tal maneira...\" - João 3:16","image":"https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true"},
    {"name":"Pastora Ana Silva","title":"Pastora Auxiliar","verse":"\"O Senhor é o meu pastor, nada me faltará.\" - Salmos 23:1","image":"https://ui-avatars.com/api/?name=Pastora+Ana&background=d4af37&color=000&size=200&bold=true"},
    {"name":"Pastor Carlos Mendes","title":"Pastor de Jovens","verse":"\"Ninguém despreze a tua mocidade...\" - 1 Timóteo 4:12","image":"https://ui-avatars.com/api/?name=Pastor+Carlos&background=d4af37&color=000&size=200&bold=true"}
  ],
  "schedule": [
    {"day":"Domingo","time":"9h","event":"EBD - Escola Bíblica","iconType":"Book"},
    {"day":"Domingo","time":"18h","event":"Culto de Celebração","iconType":"Music"},
    {"day":"Terça","time":"19h30","event":"Culto de Doutrina","iconType":"Book"},
    {"day":"Quinta","time":"19h30","event":"Culto de Oração","iconType":"Heart"}
  ],
  "activities": [
    {"title":"Distribuição de Cestas Básicas","date":"1º Sábado do Mês","description":"Ajudando famílias em situação de vulnerabilidade","image":"https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop"},
    {"title":"Sopa Solidária","date":"Toda Quarta-feira","description":"Servindo refeições para pessoas em situação de rua","image":"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop"},
    {"title":"Ensaio de Louvor","date":"Terça e Quinta","description":"Preparação da equipe de louvor para os cultos","image":"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop"}
  ],
  "cta": {"title":"Faça Parte da Nossa Família","subtitle":"Venha nos visitar e experimente o amor de Deus em nossa comunidade","primaryBtn":"Quero Visitar","primaryLink":"/contato","secondaryBtn":"Ligar Agora","secondaryLink":"tel:+5561993241084"},
  "ministries": [
    {"title":"Kids","description":"Ensinando a criança no caminho em que deve andar","link":"/kids","icon":"👶","color":"#ff6b9d"},
    {"title":"Louvor","description":"Adorando a Deus em espírito e em verdade","link":"/louvor","icon":"🎵","color":"#9b59b6"},
    {"title":"EBD","description":"Crescendo no conhecimento da Palavra","link":"/ebd","icon":"📚","color":"#d4af37"},
    {"title":"Ação Social","description":"Servindo ao próximo com amor","link":"/social","icon":"❤️","color":"#e74c3c"},
    {"title":"Lares","description":"Comunhão e crescimento nos lares","link":"/lares","icon":"🏠","color":"#3498db"},
    {"title":"Retiro","description":"Momentos de renovação espiritual","link":"/retiro","icon":"⛰️","color":"#27ae60"},
    {"title":"Mídia","description":"Comunicação e tecnologia a serviço do Reino","link":"/midia","icon":"🎬","color":"#d4af37"},
    {"title":"Intercessão","description":"Clamando ao Senhor em todo o tempo","link":"/intercessao","icon":"🙏","color":"#d4af37"},
    {"title":"Casais","description":"Edificando famílias sobre a Rocha","link":"/casais","icon":"💑","color":"#c19a6b"}
  ],
  "spotifyUrl":"https://open.spotify.com/embed/episode/6vf8aTHBG3ms8DGo5jCsAG?utm_source=generator"
}'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

-- Header
INSERT INTO public.site_settings (key, data)
VALUES ('header','{"logo":{"text":"ADMAC","icon":"✝"},"menu":[{"name":"Início","path":"/"},{"name":"Sobre","path":"/sobre"},{"name":"Contato","path":"/contato"}],"social":{"instagram":"#","youtube":"#","facebook":"#","phone":"(61) 99324-1084","music":"#"}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

-- Footer
INSERT INTO public.site_settings (key, data)
VALUES ('footer','{"logo":{"text":"ADMAC","tagline":"Vivendo o Sobrenatural"},"description":"Assembleia de Deus Ministério Atos e Conquistas.","verse":"\"Ide por todo o mundo e pregai o evangelho\" - Marcos 16:15","contact":{"address":"QN 404 Conjunto A Lote 1 - Samambaia Norte, DF","phone":"(61) 99999-9999","email":"contato@admac.com.br","cultos":"Dom 18h | Qua 19h30"},"social":{"facebook":"admac","instagram":"@admac","youtube":"ADMAC TV","whatsapp":"https://wa.me/5561993241084","spotify":"https://open.spotify.com/show/2lzm9pXbj4PCoWcxsFzDtf"}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES ('videos', '[]'::jsonb)       ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('site_status', '{"online":true,"message":""}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('pastors_contacts','[{"id":1,"name":"Pr. Roberto Silva","role":"Pastor Presidente","phone":"5561993241084","photo":""},{"id":2,"name":"Pra. Ana Silva","role":"Pastora Auxiliar","phone":"5561993241084","photo":""},{"id":3,"name":"Secretaria ADMAC","role":"Atendimento Geral","phone":"5561993241084","photo":""}]'::jsonb) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

-- Ministérios
INSERT INTO public.site_settings (key, data) VALUES ('ministry_kids',      '{"hero":{"title":"Ministério Kids","subtitle":"Ensinando o caminho em que se deve andar","image":"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop"},"info":{"schedule":["Domingos às 9h e 18h"],"location":"Sala Kids","age":"0 a 12 anos"},"schedule":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_louvor',    '{"hero":{"title":"Ministério de Louvor","subtitle":"Adorando a Deus em espírito e em verdade","image":"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Conduzir a igreja à presença de Deus."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_jovens',    '{"hero":{"title":"Ministério de Jovens","subtitle":"Jovens apaixonados por Deus","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Formar uma geração de jovens comprometidos."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_mulheres',  '{"hero":{"title":"Ministério de Mulheres","subtitle":"Mulheres transformadas pelo amor de Jesus","image":"https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Acolher e inspirar mulheres."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_homens',    '{"hero":{"title":"Ministério de Homens","subtitle":"Firmes na fé, liderando em amor","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop","videoUrl":"","testimonyUrl":""},"mission":{"title":"Nossa Missão","text":"Fortalecer homens na Palavra."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_lares',     '{"hero":{"title":"Ministério de Lares","subtitle":"Comunhão nos lares","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Levar a igreja para dentro das casas."},"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_retiro',    '{"hero":{"title":"Retiros Espirituais","subtitle":"Renovação e comunhão","image":"https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=400&fit=crop"},"mission":{"title":"Por Que Participar?","text":"Conecte-se com Deus."},"schedule":[],"team":[],"gallery":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_social',    '{"hero":{"title":"Ação Social","subtitle":"Servindo com amor","image":"https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=400&fit=crop","stats":[{"value":"500+","label":"Cestas Básicas"},{"value":"1000+","label":"Refeições"},{"value":"50+","label":"Voluntários"}]},"mission":{"title":"Nossa Missão","text":"Demonstrar o amor de Cristo em ações práticas."},"schedule":[],"gallery":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_ebd',       '{"hero":{"title":"Escola Bíblica Dominical","subtitle":"Crescendo no conhecimento","image":"https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&h=400&fit=crop"},"info":{"time":"Domingos, 9h","location":"ADMAC","audience":"Todas as idades"},"schedule":[],"team":[],"gallery":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_midia',     '{"hero":{"title":"Portal de Mídia","subtitle":"Excelência técnica a serviço do Reino","image":"imagem/midia.jpg"},"live":{"title":"Culto Online","url":"https://www.youtube.com/embed/3W6qi38SntU","description":"Ao vivo todos os domingos às 18h."},"videos":[],"team":[],"gallery":[],"schedule":[],"birthdays":{"title":"Aniversariantes","text":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_intercessao','{"hero":{"title":"Ministério de Intercessão","subtitle":"Clamando ao Senhor em todo o tempo","image":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&fit=crop"},"mission":{"title":"Nossa Missão","text":"Sustentar a igreja através da oração."},"schedule":[],"team":[],"gallery":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_missoes',   '{"hero":{"title":"Ministério de Missões","subtitle":"Levando o Evangelho a todas as nações","image":"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&fit=crop","videoUrl":""},"mission":{"title":"Nossa Missão","text":"Cumprir o IDE de Jesus."},"stats":[],"missionaries":[],"projects":[],"team":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_casais',    '{"hero":{"title":"Ministério de Casais","subtitle":"Edificando famílias sobre a Rocha","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Fortalecer o vínculo matrimonial."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversários de Casamento","text":"","videoUrl":"","people":[]}}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_sobre',     '{"hero":{"title":"Sobre a ADMAC","subtitle":"Nossa história, missão e valores","verse":"\"Até aqui nos ajudou o Senhor.\" - 1 Samuel 7:12"},"mission":{"title":"Nossa Missão","text":"Proclamar o evangelho e transformar vidas."},"team":[],"gallery":[]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_revista',   '{"hero":{"title":"Revista Admac","subtitle":"Nossa revista mensal"},"pages":[{"id":1,"type":"cover","title":"ANO DE ROMPER","subtitle":"Vivendo o sobrenatural de Deus em 2025","edition":"Edição Nº 42 • Dezembro 2025","image":"https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80"}]}') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_contact',   '{"title":"Entre em Contato","description":"Estamos aqui para te receber!","address":"QN 404 Conjunto A Lote 1 - Samambaia Norte, DF","phone":"(61) 99324-1084","email":"contato@admac.com.br","whatsapp":"https://wa.me/5561993241084","schedule":"Domingo: 18h | Quarta: 19h30 | Quinta: 19h30"}') ON CONFLICT (key) DO NOTHING;


-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================
SELECT
  '📋 site_settings'  AS tabela,
  COUNT(*)::text      AS total
FROM public.site_settings

UNION ALL

SELECT
  '👤 painel_users',
  COUNT(*)::text
FROM public.painel_users

UNION ALL

SELECT
  '🖼️  media_files',
  COUNT(*)::text
FROM public.media_files

UNION ALL

SELECT
  '🪣 storage bucket',
  name
FROM storage.buckets
WHERE id = 'admac-fotos';

-- Lista todas as chaves do site
SELECT key, updated_at
FROM public.site_settings
ORDER BY key;

-- ================================================================
-- COMO USAR O STORAGE NO PAINEL (referência)
-- URL pública de uma foto enviada:
--   https://<SEU_PROJETO>.supabase.co/storage/v1/object/public/admac-fotos/<caminho>
--
-- Pastas sugeridas no bucket:
--   admac-fotos/carousel/   → fotos do slider da Home
--   admac-fotos/pastores/   → fotos dos pastores
--   admac-fotos/kids/       → fotos do ministério Kids
--   admac-fotos/louvor/     → fotos do ministério de Louvor
--   admac-fotos/galeria/    → galeria geral
--   admac-fotos/aniversario/→ fotos de aniversariantes
--   admac-fotos/midia/      → fotos do portal de mídia
-- ================================================================
