-- ==========================================
-- SQL SETUP FOR ADMAC PROJECT
-- Execute this in your Supabase SQL Editor
-- ==========================================

-- 1. Table for configurations and page content
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional, but recommended)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- 2. Table for user profiles
CREATE TABLE IF NOT EXISTS public.site_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Viewer',
    status TEXT DEFAULT 'active',
    location TEXT,
    photo TEXT,
    password TEXT, -- For manual management if not using Supabase Auth exclusively
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.site_users FOR SELECT USING (true);
CREATE POLICY "Users can manage profiles" ON public.site_users FOR ALL USING (auth.role() = 'authenticated');

-- 3. Table for system logs
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    text TEXT,
    detail TEXT,
    "user" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can insert logs" ON public.site_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read logs" ON public.site_logs FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- Note: Supabase Auth is handled automatically. 
-- You may need to link site_users to auth.users 
-- using a Trigger if you want fully synced profiles.
-- ==========================================
