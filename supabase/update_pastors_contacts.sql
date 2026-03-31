-- ==========================================
-- ATUALIZAÇÃO DE CONFIGURAÇÕES ADMAC
-- Adiciona chaves de configuração faltantes
-- ==========================================

-- 1. Insere Contatos dos Pastores (se não existirem)
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

-- 2. Insere Status do Site (se não existir)
INSERT INTO public.site_settings (key, data)
VALUES (
  'site_status',
  '{"maintenance": false, "online": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
