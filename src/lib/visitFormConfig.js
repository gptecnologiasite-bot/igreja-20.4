// ================================================================
// visitFormConfig.js — Configuração compartilhada do formulário
// "Quero Visitar". Usada pela página pública (Visita.jsx) e pelo
// painel administrativo (VisitasPage.jsx).
// O painel salva a configuração em site_settings key = 'visit_form_config'.
// ================================================================

export const VISIT_FORM_SETTINGS_KEY = 'visit_form_config';
export const VISITOR_TABLE = 'visitor_registrations';

// Campos disponíveis no formulário. O painel liga/desliga cada um.
// "name" é sempre obrigatório e por isso não aparece na lista de opções.
export const FIELD_DEFINITIONS = [
  {
    key: 'phone',
    column: 'phone',
    label: 'Telefone / WhatsApp',
    type: 'tel',
    placeholder: '(61) 99999-9999',
  },
  {
    key: 'email',
    column: 'email',
    label: 'E-mail',
    type: 'email',
    placeholder: 'seu@email.com',
  },
  {
    key: 'neighborhood',
    column: 'neighborhood',
    label: 'Bairro / Cidade',
    type: 'text',
    placeholder: 'Ex.: Samambaia - DF',
  },
  {
    key: 'ageRange',
    column: 'age_range',
    label: 'Faixa de idade',
    type: 'select',
    options: ['Até 12 anos', '13 a 17', '18 a 25', '26 a 35', '36 a 50', '51 a 65', 'Acima de 65'],
  },
  {
    key: 'howKnew',
    column: 'how_knew',
    label: 'Como conheceu a igreja?',
    type: 'select',
    options: ['Convite de um amigo', 'Redes sociais', 'Passando em frente', 'Familiar', 'Outro'],
  },
  {
    key: 'interest',
    column: 'interest',
    label: 'Ministério de interesse',
    type: 'select',
    options: [
      'Culto de Celebração',
      'EBD',
      'Louvor',
      'Kids',
      'Jovens',
      'Mulheres',
      'Homens',
      'Casais',
      'Missões',
      'Ainda não sei',
    ],
  },
  {
    key: 'visitDate',
    column: 'visit_date',
    label: 'Data prevista da visita',
    type: 'date',
  },
  {
    key: 'message',
    column: 'message',
    label: 'Observações',
    type: 'textarea',
    placeholder: 'Algo que gostaria que soubéssemos?',
  },
];

// Perguntas extras criadas pelo painel (com opções de escolha).
// Ficam guardadas em visitor_registrations.answers (JSONB).
export const DEFAULT_VISIT_CONFIG = {
  title: 'Quero Visitar',
  subtitle: 'Deixe seus dados e nossa equipe entrará em contato com muito carinho.',
  nameLabel: 'Nome Completo',
  buttonLabel: 'Enviar meus dados',
  successMessage: 'Recebemos seus dados! Seja bem-vindo à nossa família. Em breve entraremos em contato.',
  fields: {
    phone: true,
    email: true,
    neighborhood: true,
    ageRange: true,
    howKnew: true,
    interest: true,
    visitDate: false,
    message: true,
  },
  customQuestions: [],
};

// Mescla a configuração salva no banco com os padrões (sem quebrar
// quando faltarem chaves novas).
export const mergeVisitConfig = (saved) => {
  if (!saved || typeof saved !== 'object') return { ...DEFAULT_VISIT_CONFIG };
  return {
    ...DEFAULT_VISIT_CONFIG,
    ...saved,
    fields: { ...DEFAULT_VISIT_CONFIG.fields, ...(saved.fields || {}) },
    customQuestions: Array.isArray(saved.customQuestions) ? saved.customQuestions : [],
  };
};
