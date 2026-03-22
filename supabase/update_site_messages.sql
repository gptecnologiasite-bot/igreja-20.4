-- Execute este script no SQL Editor do Supabase para adicionar a coluna de foto aos testemunhos
ALTER TABLE public.site_messages ADD COLUMN IF NOT EXISTS photo_url TEXT;
