-- ================================================================
--  ADMAC — ATUALIZAÇÃO DE SEGURANÇA (SENHAS)
--  Execute este script no Supabase: SQL Editor → New query → Run
--  Rode no MESMO projeto usado pelo site
--  (verifique a URL: Settings → API → Project URL)
-- ================================================================

-- 1. Atualiza a senha do usuário admin na tabela do painel.
--    (O login do painel usa as senhas definidas no código, mas esta
--     tabela é consultada para exibir os membros e o perfil.)
UPDATE public.site_users
SET password = 'ZArgdMkCzP8GXEmY'
WHERE email = 'admin@admin.com'
  AND password = 'REDACTED_SENHA';

-- 2. Remove qualquer usuário padrão antigo que ainda esteja com a
--    senha fraca 'REDACTED_SENHA' (criado por scripts legados).
DELETE FROM public.site_users
WHERE password = 'REDACTED_SENHA';

-- ================================================================
-- OPCIONAL (recomendado): corrigir RLS
-- Apenas se você criar contas reais no Supabase Auth.
-- ATENÇÃO: se aplicar agora, o painel deixa de funcionar, porque ele
-- ainda depende das contas de bypass (sem sessão autenticada).
-- ================================================================
-- 1) Crie o usuário admin no Auth (Authentication → Users → Add user)
--    com o e-mail admin@admin.com e uma senha forte.
-- 2) Depois execute o script abaixo para bloquear acesso anônimo
--    às tabelas do painel:
--
-- ALTER TABLE public.site_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS admac_site_users_all ON public.site_users;
-- CREATE POLICY "su_auth" ON public.site_users
--   FOR ALL USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
--
-- ALTER TABLE public.site_messages ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS admac_site_messages_all ON public.site_messages;
-- CREATE POLICY "sm_insere_pub" ON public.site_messages FOR INSERT WITH CHECK (true);
-- CREATE POLICY "sm_leitura_auth" ON public.site_messages
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "sm_update_auth" ON public.site_messages
--   FOR UPDATE USING (auth.role() = 'authenticated');
--
-- ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS admac_site_logs_all ON public.site_logs;
-- CREATE POLICY "sl_insere_todos" ON public.site_logs FOR INSERT WITH CHECK (true);
-- CREATE POLICY "sl_leitura_auth" ON public.site_logs
--   FOR SELECT USING (auth.role() = 'authenticated');
-- ================================================================
