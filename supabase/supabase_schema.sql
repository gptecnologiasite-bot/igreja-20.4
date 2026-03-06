-- ==========================================
-- SQL SETUP FOR ADMAC PROJECT
-- Execute this in your Supabase SQL Editor
-- This script creates the tables for settings, users, and logs.
-- ==========================================

-- 1. Table for configurations and page content
-- Used for: Home data, Ministry pages, Navigation, Header, etc.
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
CREATE POLICY "Allow public read access for settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');


-- 2. Table for user profiles
-- Used for: Managing admin panel users
CREATE TABLE IF NOT EXISTS public.site_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Viewer',
    status TEXT DEFAULT 'active',
    location TEXT,
    photo TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

-- Policies for site_users
CREATE POLICY "Allow public read access for users" ON public.site_users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage users" ON public.site_users FOR ALL USING (auth.role() = 'authenticated');


-- 3. Table for system logs
-- Used for: Tracking login activities and content changes
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    text TEXT,
    detail TEXT,
    "user" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;

-- Policies for site_logs
CREATE POLICY "Allow authenticated users to read logs" ON public.site_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert logs" ON public.site_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ==========================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard.
-- 2. Open the "SQL Editor" section.
-- 3. Paste this entire script into a new query.
-- 4. Click "Run".
-- ==========================================
