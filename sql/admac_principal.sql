-- ================================================================
--  ADMAC - SQL PRINCIPAL v2.0
--  Arquivo: sql/admac_principal.sql
--  Gerado em: 2026-04-01
--
--  O que este script faz:
--    1. Cria tabelas: site_settings, painel_users, media_files
--    2. Cria bucket de storage: admac-fotos
--    3. Aplica RLS + Realtime sem erro em banco já existente
--    4. Insere dados iniciais de todas as páginas e ministérios
--
--  Execute no Supabase: SQL Editor → New query → Cole → Run
-- ================================================================


-- ================================================================
-- [1] TABELA PRINCIPAL DE CONTEÚDO DO SITE
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coluna updated_at (adiciona se ainda não existir)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'site_settings'
      AND column_name  = 'updated_at'
  ) THEN
    ALTER TABLE public.site_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Segurança RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ss_leitura_publica"     ON public.site_settings;
DROP POLICY IF EXISTS "ss_escrita_autenticada" ON public.site_settings;
CREATE POLICY "ss_leitura_publica"     ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "ss_escrita_autenticada" ON public.site_settings FOR ALL    USING (auth.role() = 'authenticated');

-- Realtime (só adiciona se ainda não estiver ativo)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_settings'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings; END IF;
END $$;


-- ================================================================
-- [2] TABELA DE USUÁRIOS DO PAINEL ADMIN
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

-- Adiciona colunas que podem estar faltando
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='painel_users' AND column_name='photo')
    THEN ALTER TABLE public.painel_users ADD COLUMN photo TEXT DEFAULT ''; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='painel_users' AND column_name='location')
    THEN ALTER TABLE public.painel_users ADD COLUMN location TEXT DEFAULT ''; END IF;
END $$;

ALTER TABLE public.painel_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pu_admin_tudo" ON public.painel_users;
CREATE POLICY "pu_admin_tudo" ON public.painel_users FOR ALL USING (auth.role() = 'authenticated');

-- Admin padrão (senha: 123456)
INSERT INTO public.painel_users (name, email, password, role, status, location)
VALUES ('Administrador', 'admin@admin.com', '123456', 'Administrador', 'active', 'Samambaia, DF')
ON CONFLICT (email) DO NOTHING;


-- ================================================================
-- [3] TABELA DE FOTOS ENVIADAS PELO PAINEL
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
DROP POLICY IF EXISTS "mf_leitura_publica"  ON public.media_files;
DROP POLICY IF EXISTS "mf_escrita_auth"     ON public.media_files;
CREATE POLICY "mf_leitura_publica" ON public.media_files FOR SELECT USING (true);
CREATE POLICY "mf_escrita_auth"    ON public.media_files FOR ALL    USING (auth.role() = 'authenticated');

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'media_files'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.media_files; END IF;
END $$;


-- ================================================================
-- [4] STORAGE BUCKET PARA UPLOAD DE FOTOS
--     URL pública: https://<projeto>.supabase.co/storage/v1/object/public/admac-fotos/<caminho>
--     Pastas sugeridas: carousel/ | pastores/ | kids/ | louvor/ | galeria/ | aniversario/
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admac-fotos', 'admac-fotos', true, 10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml'];

DROP POLICY IF EXISTS "st_fotos_leitura"   ON storage.objects;
DROP POLICY IF EXISTS "st_fotos_upload"    ON storage.objects;
DROP POLICY IF EXISTS "st_fotos_delete"    ON storage.objects;
DROP POLICY IF EXISTS "st_fotos_update"    ON storage.objects;

CREATE POLICY "st_fotos_leitura" ON storage.objects FOR SELECT USING (bucket_id = 'admac-fotos');
CREATE POLICY "st_fotos_upload"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admac-fotos' AND auth.role() = 'authenticated');
CREATE POLICY "st_fotos_delete"  ON storage.objects FOR DELETE USING     (bucket_id = 'admac-fotos' AND auth.role() = 'authenticated');
CREATE POLICY "st_fotos_update"  ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'admac-fotos' AND auth.role() = 'authenticated');


-- ================================================================
-- [5] DADOS INICIAIS — HOME
-- ================================================================
INSERT INTO public.site_settings (key, data) VALUES ('home', '{
  "carousel":[
    {"image":"https://images.unsplash.com/photo-1510936111840-65e151ad71bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Culto de Louvor e Adoração","subtitle":"Venha adorar a Deus conosco"},
    {"image":"https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Comunhão e Fé","subtitle":"Uma família para pertencer"},
    {"image":"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80","title":"Ensino da Palavra","subtitle":"Crescendo na graça e no conhecimento"}
  ],
  "welcome":{"title":"Bem-vindo à ADMAC","text1":"Somos uma igreja que ama a Deus e as pessoas. Nossa missão é proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus.","text2":"Venha fazer parte da nossa família! Aqui você encontrará um lugar de acolhimento, crescimento espiritual e comunhão genuína.","buttonText":"Entre em Contato","buttonLink":"/contato"},
  "pastors":[
    {"name":"Pastor Roberto Silva","title":"Pastor Presidente","verse":"\"Porque Deus amou o mundo de tal maneira...\" - João 3:16","image":"https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true"},
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
    {"title":"Distribuição de Cestas Básicas","date":"1º Sábado do Mês","description":"Ajudando famílias em situação de vulnerabilidade","image":"https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop"},
    {"title":"Sopa Solidária","date":"Toda Quarta-feira","description":"Servindo refeições para pessoas em situação de rua","image":"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop"},
    {"title":"Ensaio de Louvor","date":"Terça e Quinta","description":"Preparação da equipe de louvor para os cultos","image":"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop"}
  ],
  "cta":{"title":"Faça Parte da Nossa Família","subtitle":"Venha nos visitar e experimente o amor de Deus em nossa comunidade","primaryBtn":"Quero Visitar","primaryLink":"/contato","secondaryBtn":"Ligar Agora","secondaryLink":"tel:+5561993241084"},
  "ministries":[
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


-- ================================================================
-- [6] DADOS INICIAIS — HEADER, FOOTER, STATUS, VÍDEOS, PASTORES
-- ================================================================
INSERT INTO public.site_settings (key, data) VALUES
('header','{"logo":{"text":"ADMAC","icon":"✝"},"menu":[{"name":"Início","path":"/"},{"name":"Sobre","path":"/sobre"},{"name":"Contato","path":"/contato"}],"social":{"instagram":"#","youtube":"#","facebook":"#","phone":"(61) 99324-1084","music":"#"}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES
('footer','{"logo":{"text":"ADMAC","tagline":"Vivendo o Sobrenatural"},"description":"Assembleia de Deus Ministério Atos e Conquistas - Uma igreja comprometida com a Palavra de Deus e a transformação de vidas.","verse":"\"Ide por todo o mundo e pregai o evangelho\" - Marcos 16:15","contact":{"address":"QN 404 Conjunto A Lote 1 - Samambaia Norte, DF","phone":"(61) 99999-9999","email":"contato@admac.com.br","cultos":"Dom 18h | Qua 19h30"},"social":{"facebook":"admac","instagram":"@admac","youtube":"ADMAC TV","whatsapp":"https://wa.me/5561993241084","spotify":"https://open.spotify.com/show/2lzm9pXbj4PCoWcxsFzDtf"}}'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO public.site_settings (key, data) VALUES ('videos',          '[]'::jsonb)                           ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('site_status',     '{"online":true,"message":""}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('pastors_contacts','[{"id":1,"name":"Pr. Roberto Silva","role":"Pastor Presidente","phone":"5561993241084","photo":""},{"id":2,"name":"Pra. Ana Silva","role":"Pastora Auxiliar","phone":"5561993241084","photo":""},{"id":3,"name":"Secretaria ADMAC","role":"Atendimento Geral","phone":"5561993241084","photo":""}]'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;


-- ================================================================
-- [7] DADOS INICIAIS — TODAS AS PÁGINAS DE MINISTÉRIOS
--     ON CONFLICT DO NOTHING = preserva edições já feitas no painel
-- ================================================================
INSERT INTO public.site_settings (key, data) VALUES ('ministry_contact',    '{"title":"Entre em Contato","description":"Estamos aqui para te receber!","address":"QN 404 Conjunto A Lote 1 - Samambaia Norte, DF","phone":"(61) 99324-1084","email":"contato@admac.com.br","whatsapp":"https://wa.me/5561993241084","schedule":"Domingo: 18h | Quarta: 19h30 | Quinta: 19h30"}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_kids',       '{"hero":{"title":"Ministério Kids","subtitle":"Ensinando o caminho em que se deve andar","image":"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop"},"info":{"schedule":["Domingos às 9h e 18h","Terças às 19h30"],"location":"Sala Kids - Térreo","age":"0 a 12 anos"},"schedule":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"Vamos celebrar a vida dos nossos pequenos!","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_louvor',     '{"hero":{"title":"Ministério de Louvor","subtitle":"Adorando a Deus em espírito e em verdade","verse":"\"Cantai ao Senhor um cântico novo...\" - Salmos 96:1","image":"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Conduzir a igreja à presença de Deus através da música, com excelência e unção."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"Parabéns!","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_jovens',     '{"hero":{"title":"Ministério de Jovens","subtitle":"Jovens apaixonados por Deus","verse":"\"Ninguém despreze a tua mocidade...\" - 1 Timóteo 4:12","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Formar uma geração de jovens comprometidos com a Palavra de Deus."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_mulheres',   '{"hero":{"title":"Ministério de Mulheres","subtitle":"Mulheres transformadas pelo amor de Jesus","verse":"\"Mulher virtuosa, quem a achará?\" - Provérbios 31:10","image":"https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Acolher, ensinar e inspirar mulheres a viverem o propósito de Deus."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_homens',     '{"hero":{"title":"Ministério de Homens","subtitle":"Firmes na fé, liderando em amor","verse":"\"Sede firmes, inabaláveis...\" - 1 Coríntios 15:58","videoUrl":"","testimonyUrl":"","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Fortalecer homens na Palavra e no caráter de Cristo."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_lares',      '{"hero":{"title":"Ministério de Lares","subtitle":"Comunhão nos lares","verse":"\"...partindo o pão em casa\" - Atos 2:46","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Levar a igreja para dentro das casas."},"team":[],"gallery":[],"birthdays":{"title":"Aniversariantes","text":"","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_retiro',     '{"hero":{"title":"Retiros Espirituais","subtitle":"Renovação e comunhão","verse":"\"Vinde a mim...\" - Mateus 11:28","image":"https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=400&fit=crop"},"mission":{"title":"Por Que Participar?","text":"Desconecte-se do mundo e conecte-se com Deus."},"schedule":[],"team":[],"gallery":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_social',     '{"hero":{"title":"Ação Social","subtitle":"Servindo com amor","image":"https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=400&fit=crop","stats":[{"value":"500+","label":"Cestas Básicas"},{"value":"1000+","label":"Refeições"},{"value":"50+","label":"Voluntários"}]},"mission":{"title":"Nossa Missão","text":"Demonstrar o amor de Cristo através de ações práticas."},"schedule":[],"gallery":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_ebd',        '{"hero":{"title":"Escola Bíblica Dominical","subtitle":"Crescendo no conhecimento","verse":"\"Conheçamos e prossigamos em conhecer ao Senhor.\" - Oseias 6:3","image":"https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&h=400&fit=crop"},"info":{"time":"Domingos, 9h","location":"ADMAC","audience":"Todas as idades"},"schedule":[],"team":[],"gallery":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_midia',      '{"hero":{"title":"Portal de Mídia","subtitle":"Excelência técnica e criatividade a serviço do Reino de Deus","image":"imagem/midia.jpg","verse":"\"...pregai-o sobre os telhados.\" - Mateus 10:27"},"live":{"title":"Culto Online - Assista Agora","url":"https://www.youtube.com/embed/3W6qi38SntU?si=4vC2GYojoOU2IfWY","description":"Transmissões ao vivo todos os domingos às 18h."},"videos":[],"team":[{"name":"Humberto Freitas","role":"Coordenador Geral","photo":"imagem/midia.jpg"}],"gallery":[],"schedule":[],"birthdays":{"title":"Aniversariantes do Mês","text":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_intercessao','{"hero":{"title":"Ministério de Intercessão","subtitle":"Clamando ao Senhor em todo o tempo","verse":"\"Orai sem cessar.\" - 1 Tessalonicenses 5:17","image":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80"},"mission":{"title":"Nossa Missão","text":"Sustentar a igreja através da oração intercessória."},"schedule":[],"team":[],"gallery":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_missoes',    '{"hero":{"title":"Ministério de Missões","subtitle":"Levando o Evangelho a todas as nações","verse":"\"Ide por todo o mundo e pregai o evangelho a toda criatura.\" - Marcos 16:15","image":"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80","videoUrl":""},"mission":{"title":"Nossa Missão","text":"Cumprir o IDE de Jesus, apoiando missionários no campo."},"stats":[],"missionaries":[],"projects":[],"team":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_casais',     '{"hero":{"title":"Ministério de Casais","subtitle":"Edificando famílias sobre a Rocha","verse":"\"Portanto, o que Deus ajuntou não o separe o homem.\" - Mateus 19:6","image":"https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop"},"mission":{"title":"Nossa Missão","text":"Fortalecer o vínculo matrimonial através do ensino bíblico."},"schedule":[],"team":[],"gallery":[],"birthdays":{"title":"Aniversários de Casamento","text":"Celebrando a união!","videoUrl":"","people":[]}}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_sobre',      '{"hero":{"title":"Sobre a ADMAC","subtitle":"Nossa história, missão e valores","verse":"\"Até aqui nos ajudou o Senhor.\" - 1 Samuel 7:12"},"mission":{"title":"Nossa Missão","text":"Proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas."},"team":[{"name":"Pr. Roberto Silva","role":"Pastor Presidente","photo":"https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true"}],"gallery":[]}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, data) VALUES ('ministry_revista',    '{"hero":{"title":"Revista Admac","subtitle":"Nossa revista mensal"},"pages":[{"id":1,"type":"cover","title":"ANO DE ROMPER","subtitle":"Vivendo o sobrenatural de Deus em 2025","edition":"Edição Nº 42 • Dezembro 2025","image":"https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80"}]}'::jsonb) ON CONFLICT (key) DO NOTHING;


-- ================================================================
-- [8] VERIFICAÇÃO FINAL
-- ================================================================
SELECT
  '✅ site_settings'  AS tabela, COUNT(*)::TEXT AS registros FROM public.site_settings
UNION ALL SELECT '✅ painel_users',  COUNT(*)::TEXT FROM public.painel_users
UNION ALL SELECT '✅ media_files',   COUNT(*)::TEXT FROM public.media_files
UNION ALL SELECT '🪣 admac-fotos bucket', name       FROM storage.buckets WHERE id = 'admac-fotos';

SELECT key, left(data::text, 70) || '...' AS preview, updated_at
FROM public.site_settings ORDER BY key;

-- ================================================================
-- FIM — sql/admac_principal.sql
-- ================================================================
