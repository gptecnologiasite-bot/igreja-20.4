-- ==========================================
-- SQL SETUP PARA O PROJETO ADMAC (SUPABASE)
-- Copie e cole este código no "SQL Editor" do seu painel Supabase
-- ==========================================

-- 1. Tabela para configurações e conteúdo das páginas (Home, Ministérios, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (Segurança de Linha)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para site_settings
CREATE POLICY "Public read access" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Auth manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');


-- 2. Tabela para os usuários do painel administrativo
CREATE TABLE IF NOT EXISTS public.site_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Viewer',
    status TEXT DEFAULT 'active',
    location TEXT,
    photo TEXT,
    password TEXT, -- Senha criptografada (opcional se usar Auth pura)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para site_users
CREATE POLICY "Public read access for users" ON public.site_users FOR SELECT USING (true);
CREATE POLICY "Auth manage users" ON public.site_users FOR ALL USING (auth.role() = 'authenticated');


-- 3. Tabela para Logs do Sistema (Histórico de alterações)
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,       -- Tipo: 'auth', 'page_edit', 'user_edit'
    text TEXT,       -- Descrição curta
    detail TEXT,     -- Detalhes (ex: nome da página salva)
    "user" TEXT,     -- Nome do usuário que fez a ação
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para site_logs
CREATE POLICY "Auth read logs" ON public.site_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth insert logs" ON public.site_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ==========================================
-- INSTRUÇÕES DE USO:
-- 1. No Supabase, clique em "SQL Editor" no menu lateral.
-- 2. Clique em "+ New query".
-- 3. Cole este código e clique em "Run".
-- ==========================================
