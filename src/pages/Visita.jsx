// ================================================================
// Visita.jsx — Página pública "Quero Visitar"
// Formulário de cadastro de visitantes. Os campos exibidos são
// configuráveis pelo painel (Visitas → Configurar formulário) e a
// configuração é lida de site_settings key = 'visit_form_config'.
// Os envios vão para a tabela public.visitor_registrations.
// ================================================================

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';
import {
  VISIT_FORM_SETTINGS_KEY,
  VISITOR_TABLE,
  FIELD_DEFINITIONS,
  mergeVisitConfig,
} from '../lib/visitFormConfig';
import '../css/Visita.css';

const LocalCacheKey = `admac_site_settings:${VISIT_FORM_SETTINGS_KEY}`;
const BackupKey = 'admac_visitors_backup';

const Visita = () => {
  const [config, setConfig] = useState(() => mergeVisitConfig(null));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadConfig = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', VISIT_FORM_SETTINGS_KEY)
        .limit(1)
        .single();

      if (error) {
        const raw = localStorage.getItem(LocalCacheKey);
        if (raw) setConfig(mergeVisitConfig(parseSafeJson(raw)));
        return;
      }

      if (dbData && dbData.data) {
        const parsed = parseSafeJson(dbData.data);
        setConfig(mergeVisitConfig(parsed));
        localStorage.setItem(LocalCacheKey, JSON.stringify(parsed || {}));
      }
    } catch (err) {
      console.warn('[Visita] Não foi possível carregar a configuração:', err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const visibleFields = FIELD_DEFINITIONS.filter((f) => config.fields?.[f.key]);
  const customQuestions = Array.isArray(config.customQuestions) ? config.customQuestions : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const form = e.target;
    const formData = new FormData(form);
    const get = (name) => (formData.get(name) || '').toString().trim();

    const answers = {};
    customQuestions.forEach((q, idx) => {
      const value = get(`custom_${idx}`);
      if (value) answers[q.label || `Pergunta ${idx + 1}`] = value;
    });

    const payload = {
      name: get('name'),
      phone: get('phone'),
      email: get('email'),
      neighborhood: get('neighborhood'),
      age_range: get('ageRange'),
      how_knew: get('howKnew'),
      interest: get('interest'),
      visit_date: get('visitDate') || null,
      message: get('message'),
      answers,
      status: 'novo',
    };

    try {
      const { error } = await supabase.from(VISITOR_TABLE).insert(payload);
      if (error) throw error;
      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error('[Visita] Erro ao enviar cadastro:', err);
      try {
        const backups = JSON.parse(localStorage.getItem(BackupKey) || '[]');
        backups.push({ ...payload, created_at: new Date().toISOString() });
        localStorage.setItem(BackupKey, JSON.stringify(backups));
      } catch (storageErr) {
        console.warn('[Visita] Falha ao salvar backup local:', storageErr);
      }
      setSubmitted(true);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="visita-page">
      <div className="visita-header">
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
      </div>

      <div className="visita-container">
        {submitted ? (
          <div className="visita-success">
            <CheckCircle size={48} />
            <h3>Deus abençoe!</h3>
            <p>{config.successMessage}</p>
            <button type="button" className="visita-btn-primary" onClick={() => setSubmitted(false)}>
              Enviar outro cadastro
            </button>
          </div>
        ) : (
          <form className="visita-form" onSubmit={handleSubmit}>
            <div className="visita-field">
              <label htmlFor="name">{config.nameLabel || 'Nome Completo'} *</label>
              <input type="text" id="name" name="name" placeholder="Seu nome" required />
            </div>

            {visibleFields.map((field) => (
              <div className="visita-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    rows="4"
                    placeholder={field.placeholder || ''}
                  />
                ) : field.type === 'select' ? (
                  <select id={field.key} name={field.key} defaultValue="">
                    <option value="">Selecione…</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.key}
                    name={field.key}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            ))}

            {customQuestions.map((q, idx) => (
              <div className="visita-field" key={`custom-${idx}`}>
                <label htmlFor={`custom_${idx}`}>{q.label || `Pergunta ${idx + 1}`}</label>
                {Array.isArray(q.options) && q.options.length > 0 ? (
                  <select id={`custom_${idx}`} name={`custom_${idx}`} defaultValue="">
                    <option value="">Selecione…</option>
                    {q.options.map((opt, oi) => (
                      <option key={`${oi}-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" id={`custom_${idx}`} name={`custom_${idx}`} />
                )}
              </div>
            ))}

            <button type="submit" className="visita-btn-primary" disabled={submitting}>
              <Send size={18} /> {submitting ? 'Enviando…' : config.buttonLabel || 'Enviar meus dados'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Visita;
