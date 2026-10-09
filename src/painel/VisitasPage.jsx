// ================================================================
// VisitasPage.jsx — Painel → Visitas
// Gerencia os cadastros do formulário "Quero Visitar":
//   • Aba "Registros": listar, editar, excluir e contatar visitantes
//     (WhatsApp / E-mail), além de anexar um link por pessoa.
//   • Aba "Configurar formulário": escolher quais campos aparecem,
//     editar textos e criar perguntas extras com opções de escolha.
// A configuração é salva em site_settings key = 'visit_form_config'.
// ================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';
import { palette } from './theme';
import {
  VISIT_FORM_SETTINGS_KEY,
  VISITOR_TABLE,
  FIELD_DEFINITIONS,
  mergeVisitConfig,
  DEFAULT_VISIT_CONFIG,
} from '../lib/visitFormConfig';

const STATUS_OPTIONS = ['novo', 'contatado', 'visitou', 'integrado', 'arquivado'];

const STATUS_STYLE = {
  novo: { bg: 'rgba(56,189,248,.15)', color: '#38bdf8' },
  contatado: { bg: 'rgba(245,158,11,.15)', color: '#f59e0b' },
  visitou: { bg: 'rgba(108,99,255,.18)', color: '#8b84ff' },
  integrado: { bg: 'rgba(34,211,165,.15)', color: '#22d3a5' },
  arquivado: { bg: 'rgba(124,130,160,.15)', color: '#7c82a0' },
};

const onlyDigits = (v) => (v || '').toString().replace(/\D/g, '');
const whatsappLink = (phone, name) => {
  const d = onlyDigits(phone);
  const num = d ? (d.startsWith('55') ? d : `55${d}`) : '';
  const text = encodeURIComponent(`Olá ${name || ''}, aqui é da ADMAC! Recebemos seu cadastro de visita.`).trim();
  return `https://wa.me/${num}?text=${text}`;
};

const VisitasPage = () => {
  const [tab, setTab] = useState('registros');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [config, setConfig] = useState(() => mergeVisitConfig(null));
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState('');
  const [editRec, setEditRec] = useState(null);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(VISITOR_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[Visitas] Erro ao carregar cadastros:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', VISIT_FORM_SETTINGS_KEY)
        .limit(1)
        .single();
      if (error) return;
      if (data && data.data) setConfig(mergeVisitConfig(parseSafeJson(data.data)));
    } catch (err) {
      console.warn('[Visitas] Erro ao carregar configuração:', err);
    }
  };

  useEffect(() => {
    loadRecords();
    loadConfig();
  }, []);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.name, r.phone, r.email, r.neighborhood, r.interest]
      .filter(Boolean)
      .some((v) => v.toString().toLowerCase().includes(q));
  });

  const saveRecord = async () => {
    if (!editRec) return;
    try {
      const { error } = await supabase
        .from(VISITOR_TABLE)
        .update({
          status: editRec.status,
          link: editRec.link,
          message: editRec.message,
        })
        .eq('id', editRec.id);
      if (error) throw error;
      setRecords((prev) => prev.map((r) => (r.id === editRec.id ? { ...r, ...editRec } : r)));
      setEditRec(null);
    } catch (err) {
      console.error('[Visitas] Erro ao salvar cadastro:', err);
      alert('Não foi possível salvar. Tente novamente.');
    }
  };

  const deleteRecord = async (rec) => {
    if (!window.confirm(`Excluir o cadastro de "${rec.name || 'visitante'}"?`)) return;
    try {
      const { error } = await supabase.from(VISITOR_TABLE).delete().eq('id', rec.id);
      if (error) throw error;
      setRecords((prev) => prev.filter((r) => r.id !== rec.id));
    } catch (err) {
      console.error('[Visitas] Erro ao excluir cadastro:', err);
      alert('Não foi possível excluir. Tente novamente.');
    }
  };

  const updateStatus = async (rec, status) => {
    try {
      const { error } = await supabase.from(VISITOR_TABLE).update({ status }).eq('id', rec.id);
      if (error) throw error;
      setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status } : r)));
    } catch (err) {
      console.warn('[Visitas] Erro ao atualizar status:', err);
    }
  };

  // ---------- Configuração do formulário ----------
  const toggleField = (key) =>
    setConfig((c) => ({ ...c, fields: { ...c.fields, [key]: !c.fields[key] } }));

  const setConfigField = (path, value) => setConfig((c) => ({ ...c, [path]: value }));

  const addQuestion = () =>
    setConfig((c) => ({ ...c, customQuestions: [...c.customQuestions, { label: '', options: [] }] }));

  const updateQuestion = (idx, patch) =>
    setConfig((c) => ({
      ...c,
      customQuestions: c.customQuestions.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }));

  const removeQuestion = (idx) =>
    setConfig((c) => ({ ...c, customQuestions: c.customQuestions.filter((_, i) => i !== idx) }));

  const saveConfig = async () => {
    setSavingConfig(true);
    setConfigMsg('');
    try {
      const payload = {
        ...config,
        fields: { ...DEFAULT_VISIT_CONFIG.fields, ...config.fields },
      };
      const { error } = await supabase.from('site_settings').upsert({ key: VISIT_FORM_SETTINGS_KEY, data: payload });
      if (error) throw error;
      setConfigMsg('Configuração salva com sucesso!');
    } catch (err) {
      console.error('[Visitas] Erro ao salvar configuração:', err);
      setConfigMsg('Não foi possível salvar a configuração.');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'registros', label: '🙋 Registros' },
          { id: 'config', label: '⚙️ Configurar formulário' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '.5rem 1rem',
              borderRadius: 9,
              cursor: 'pointer',
              fontSize: '.85rem',
              fontWeight: 600,
              border: `1px solid ${tab === t.id ? palette.accent : palette.border}`,
              background: tab === t.id ? palette.accentGlow : 'transparent',
              color: tab === t.id ? palette.accentLight : palette.textMuted,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'registros' && (
        <div className="painel-card">
          <div className="painel-table-bar">
            <div className="painel-search-wrap">
              <span>🔍</span>
              <input
                className="painel-search"
                placeholder="Buscar visitante…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ color: palette.textMuted, fontSize: '.82rem' }}>
              {records.length} cadastro(s) · {filtered.length} exibido(s)
            </div>
          </div>

          {loading ? (
            <p style={{ color: palette.textMuted, padding: '1rem 0' }}>Carregando…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: palette.textMuted, padding: '1rem 0' }}>Nenhum cadastro encontrado.</p>
          ) : (
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Interesse</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = STATUS_STYLE[r.status] || STATUS_STYLE.novo;
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name || '—'}</strong>
                          {r.neighborhood ? (
                            <div style={{ color: palette.textMuted, fontSize: '.76rem' }}>{r.neighborhood}</div>
                          ) : null}
                        </td>
                        <td>
                          {r.phone ? <div>{r.phone}</div> : null}
                          {r.email ? (
                            <div style={{ color: palette.textMuted, fontSize: '.78rem' }}>{r.email}</div>
                          ) : null}
                          {!r.phone && !r.email ? '—' : null}
                        </td>
                        <td>{r.interest || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td>
                          <select
                            className="painel-filter-select"
                            value={r.status || 'novo'}
                            onChange={(e) => updateStatus(r, e.target.value)}
                            style={{ background: st.bg, color: st.color, fontWeight: 600, border: 'none' }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {r.phone ? (
                            <a
                              className="btn-editar"
                              style={{ textDecoration: 'none', marginRight: 6 }}
                              href={whatsappLink(r.phone, r.name)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          ) : null}
                          {r.email ? (
                            <a
                              className="btn-ver"
                              style={{ textDecoration: 'none', marginRight: 6 }}
                              href={`mailto:${r.email}`}
                            >
                              E-mail
                            </a>
                          ) : null}
                          {r.link ? (
                            <a
                              className="painel-action-btn"
                              style={{ textDecoration: 'none', marginRight: 6 }}
                              href={r.link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Link
                            </a>
                          ) : null}
                          <button className="painel-action-btn" style={{ marginRight: 6 }} onClick={() => setEditRec({ ...r })}>
                            Editar
                          </button>
                          <button className="btn-deletar" onClick={() => deleteRecord(r)}>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'config' && (
        <div className="painel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="pm-row">
            <div className="pm-field">
              <label>Título</label>
              <input className="pm-input" value={config.title} onChange={(e) => setConfigField('title', e.target.value)} />
            </div>
            <div className="pm-field">
              <label>Texto do botão</label>
              <input
                className="pm-input"
                value={config.buttonLabel}
                onChange={(e) => setConfigField('buttonLabel', e.target.value)}
              />
            </div>
          </div>

          <div className="pm-field">
            <label>Subtítulo</label>
            <input className="pm-input" value={config.subtitle} onChange={(e) => setConfigField('subtitle', e.target.value)} />
          </div>

          <div className="pm-field">
            <label>Mensagem de sucesso</label>
            <input
              className="pm-input"
              value={config.successMessage}
              onChange={(e) => setConfigField('successMessage', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: palette.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: '.6rem' }}>
              Campos exibidos no formulário
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.55rem' }}>
              {FIELD_DEFINITIONS.map((f) => (
                <label
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.55rem',
                    background: palette.bg,
                    border: `1px solid ${config.fields?.[f.key] ? palette.accent : palette.border}`,
                    borderRadius: 9,
                    padding: '.6rem .8rem',
                    cursor: 'pointer',
                    fontSize: '.85rem',
                  }}
                >
                  <input type="checkbox" checked={!!config.fields?.[f.key]} onChange={() => toggleField(f.key)} />
                  {f.label}
                </label>
              ))}
            </div>
            <p style={{ color: palette.textMuted, fontSize: '.76rem', marginTop: '.5rem' }}>
              O campo “Nome Completo” é sempre obrigatório.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
              <label style={{ fontSize: '.75rem', color: palette.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
                Perguntas extras (com opções de escolha)
              </label>
              <button type="button" className="pm-add-btn" onClick={addQuestion}>
                + Adicionar pergunta
              </button>
            </div>
            {config.customQuestions.length === 0 ? (
              <p style={{ color: palette.textMuted, fontSize: '.82rem' }}>Nenhuma pergunta extra.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                {config.customQuestions.map((q, idx) => (
                  <div key={idx} className="pm-row" style={{ alignItems: 'end' }}>
                    <div className="pm-field" style={{ marginBottom: 0 }}>
                      <label>Pergunta</label>
                      <input
                        className="pm-input"
                        value={q.label || ''}
                        placeholder="Ex.: Qual horário prefere?"
                        onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                      />
                    </div>
                    <div className="pm-field" style={{ marginBottom: 0 }}>
                      <label>Opções (separe por vírgula)</label>
                      <input
                        className="pm-input"
                        value={(q.options || []).join(', ')}
                        placeholder="Manhã, Tarde, Noite"
                        onChange={(e) =>
                          updateQuestion(idx, {
                            options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <button type="button" className="btn-deletar" style={{ height: 40 }} onClick={() => removeQuestion(idx)}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="button" className="pm-btn-save" disabled={savingConfig} onClick={saveConfig}>
              {savingConfig ? 'Salvando…' : 'Salvar configuração'}
            </button>
            {configMsg ? <span style={{ color: palette.textMuted, fontSize: '.85rem' }}>{configMsg}</span> : null}
          </div>
        </div>
      )}

      {editRec && (
        <div className="pm-backdrop" onClick={() => setEditRec(null)}>
          <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-header">
              <strong>Editar cadastro</strong>
              <button className="pm-close" onClick={() => setEditRec(null)}>
                ×
              </button>
            </div>
            <div className="pm-body">
              <div className="pm-field">
                <label>Nome</label>
                <input className="pm-input" value={editRec.name || ''} readOnly />
              </div>
              <div className="pm-field">
                <label>Status</label>
                <select
                  className="pm-select"
                  value={editRec.status || 'novo'}
                  onChange={(e) => setEditRec((r) => ({ ...r, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pm-field">
                <label>Link (opcional)</label>
                <input
                  className="pm-input"
                  value={editRec.link || ''}
                  placeholder="https://…"
                  onChange={(e) => setEditRec((r) => ({ ...r, link: e.target.value }))}
                />
              </div>
              <div className="pm-field">
                <label>Observações</label>
                <textarea
                  className="pm-input"
                  rows="3"
                  value={editRec.message || ''}
                  onChange={(e) => setEditRec((r) => ({ ...r, message: e.target.value }))}
                />
              </div>
            </div>
            <div className="pm-footer">
              <button type="button" className="pm-btn-cancel" onClick={() => setEditRec(null)}>
                Cancelar
              </button>
              <button type="button" className="pm-btn-save" onClick={saveRecord}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitasPage;
