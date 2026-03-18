-- ======================================================
-- INICIALIZAÇÃO DO MINISTÉRIO DE LOUVOR (Geral + Galeria)
-- Execute no Editor SQL do Supabase
-- ======================================================

-- Garante que a entrada para o ministério de louvor existe com a estrutura básica
INSERT INTO public.site_settings (key, data)
VALUES (
  'ministry_louvor',
  '{
    "hero": {
      "title": "Ministério de Louvor",
      "subtitle": "Adorando a Deus em espírito e em verdade através da música.",
      "verse": "Cantai-lhe um cântico novo; tocai bem e com júbilo. (Salmos 33:3)",
      "videoUrl": "",
      "image": ""
    },
    "mission": {
      "title": "Nossa Missão",
      "text": "O Ministério de Louvor tem como propósito conduzir a igreja à presença de Deus através da adoração musical, preparando os corações para a recepção da Palavra e glorificando o nome do Senhor com excelência e dedicação."
    },
    "team": [],
    "schedule": [
      {
        "activity": "Ensaio Geral",
        "day": "Sábado",
        "time": "16:00",
        "location": "Templo Principal",
        "description": "Ensaio de todas as vozes e instrumentos para o culto de Domingo."
      }
    ],
    "gallery": [],
    "birthdays": {
      "title": "Aniversariantes do Louvor",
      "text": "Celebrando a vida daqueles que dedicam seus talentos ao Senhor.",
      "videoUrl": "",
      "people": []
    },
    "active": true
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE 
SET data = jsonb_set(
  jsonb_set(
    public.site_settings.data, 
    '{gallery}', 
    COALESCE(public.site_settings.data->'gallery', '[]'::jsonb), 
    true
  ),
  '{birthdays}', 
  COALESCE(public.site_settings.data->'birthdays', '{"title": "Aniversariantes", "people": []}'::jsonb), 
  true
);

-- Nota: O comando acima garante que as chaves 'gallery' e 'birthdays' existam no JSONB 
-- sem apagar o que já estiver lá (como hero ou team) caso o registro já exista.
