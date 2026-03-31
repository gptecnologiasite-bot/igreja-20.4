-- ==========================================
-- SETUP INFRAESTRUTURA ADMAC (COMPLETO)
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- 1. Criação das Tabelas Necessárias (se não existirem)

-- Tabela de Configurações do Site
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Usuários (Painel)
CREATE TABLE IF NOT EXISTS public.site_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'Viewer',
  status TEXT DEFAULT 'active',
  photo TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Mensagens de Contato
CREATE TABLE IF NOT EXISTS public.site_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  photo_url TEXT,
  category TEXT DEFAULT 'geral',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS public.site_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT,
  user_email TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar Realtime
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.site_settings;
COMMIT;


INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de RLS (Row Level Security)
-- NOTA: Como você usa um login "bypass" (admin@admin.com), o Supabase te enxerga como 'anon'.
-- Para que o painel funcione sem o Auth oficial, liberamos acesso para o role 'anon'.

-- Políticas para SITE_SETTINGS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Total Site Settings" ON public.site_settings;
CREATE POLICY "Acesso Total Site Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- Políticas para SITE_USERS
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Total Site Users" ON public.site_users;
CREATE POLICY "Acesso Total Site Users" ON public.site_users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para SITE_MESSAGES
ALTER TABLE public.site_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Total Site Messages" ON public.site_messages;
CREATE POLICY "Acesso Total Site Messages" ON public.site_messages FOR ALL USING (true) WITH CHECK (true);

-- Políticas para SITE_LOGS
ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Total Site Logs" ON public.site_logs;
CREATE POLICY "Acesso Total Site Logs" ON public.site_logs FOR ALL USING (true) WITH CHECK (true);

-- Políticas para STORAGE (site-images)
-- Leitura Pública
DROP POLICY IF EXISTS "Acesso Público de Leitura" ON storage.objects;
CREATE POLICY "Acesso Público de Leitura" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');

-- Gestão Total para Anon e Autenticado (necessário para o bypass)
DROP POLICY IF EXISTS "Gestão de Imagens" ON storage.objects;
CREATE POLICY "Gestão de Imagens" ON storage.objects FOR ALL 
USING (bucket_id = 'site-images')
WITH CHECK (bucket_id = 'site-images');

-- 5. Dados Iniciais de Configuração
-- Insere Contatos dos Pastores (se não existirem)
INSERT INTO public.site_settings (key, data)
VALUES (
  'pastors_contacts',
  '[
    {"id": 1, "name": "Pr. Roberto Silva", "role": "Pastor Presidente", "phone": "5561993241084", "photo": ""},
    {"id": 2, "name": "Pra. Ana Silva", "role": "Pastora Auxiliar", "phone": "5561993241084", "photo": ""},
    {"id": 3, "name": "Secretaria ADMAC", "role": "Atendimento Geral", "phone": "5561993241084", "photo": ""}
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Insere Status do Site (se não existir)
INSERT INTO public.site_settings (key, data)
VALUES (
  'site_status',
  '{"maintenance": false, "online": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
