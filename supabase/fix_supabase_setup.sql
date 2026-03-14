-- ==========================================
-- SQL DE RECUPERAÇÃO E RLS (SUPABASE)
-- Use este script se o Painel mostrar "Offline" ou "Permissão Negada"
-- ==========================================

-- 1. Garante que a tabela existe
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilita RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Remove políticas antigas para evitar conflitos (opcional/seguro)
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Auth manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anon manage settings" ON public.site_settings;

-- 4. Cria novas políticas (Permite leitura pública e escrita autenticada/anon)
CREATE POLICY "Public read access" ON public.site_settings FOR SELECT USING (true);

-- Permite salvar se estiver logado com conta real
CREATE POLICY "Auth manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- PERMITE SALVAR COM A CONTA MESTRE (admin@admin.com) que usa a chave anon
-- Importante: Isso permite que qualquer pessoa com a chave anônima salve dados.
-- Use apenas se você confia em quem tem acesso ao painel.
CREATE POLICY "Anon manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'anon');


-- 5. Repete para Logs (opcional se não usar logs)
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT,
    user_email TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert logs" ON public.site_logs;
CREATE POLICY "Public insert logs" ON public.site_logs FOR INSERT WITH CHECK (true);

-- ==========================================
-- INSTRUÇÕES:
-- 1. Vá no SQL Editor do Supabase.
-- 2. Cole este código e clique em RUN.
-- ==========================================
