import React from 'react';
import { parseSafeJson, transformImageLink } from '../lib/dbUtils';
import { broadcastUpdate } from '../hooks/usePageUpdate';

/** Chave em site_settings: home usa "home", demais ministérios "ministry_<id>" (nunca "ministry_home"). */
const settingsKeyForBirthdayTarget = (ministryId) => (ministryId === 'home' ? 'home' : `ministry_${ministryId}`);

function HomeAnivEditor({ palette, ministryOptions, handleFileUpload, hasSupabase, supabase, currentUser }) {
  const [selMin, setSelMin] = React.useState(ministryOptions.find(o => o.value !== 'home')?.value || ministryOptions[0]?.value || 'jovens');
  const [bData, setBData] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const fetchMinistryBirthdays = async (id) => {
    const key = settingsKeyForBirthdayTarget(id);
    try {
      if (!hasSupabase || !supabase) {
        const raw = localStorage.getItem(`admac_site_settings:${key}`);
        const parsed = raw ? parseSafeJson(raw) : null;
        return parsed?.birthdays || { title: '', text: '', videoUrl: '', people: [] };
      }
      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', key)
        .maybeSingle();
      if (error) {
        console.warn('[HomeAnivEditor] Leitura:', error.message);
      }
      const parsed = parseSafeJson(dbData?.data);
      return parsed?.birthdays || { title: '', text: '', videoUrl: '', people: [] };
    } catch (e) {
      console.warn('[HomeAnivEditor] fetchMinistryBirthdays:', e);
      return { title: '', text: '', videoUrl: '', people: [] };
    }
  };

  React.useEffect(() => {
    setBData(null);
    fetchMinistryBirthdays(selMin).then(setBData);
  }, [selMin]);

  const updatePeople = (next) => setBData(d => ({ ...d, people: next }));

  const handleSave = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem salvar alterações.');
      return;
    }
    if (!bData) return;

    setSaving(true);
    setMsg('');
    const key = settingsKeyForBirthdayTarget(selMin);

    const persistLocal = (fullObj) => {
      try {
        localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(fullObj));
      } catch (e) {
        console.warn('localStorage:', e);
      }
      broadcastUpdate(key);
    };

    try {
      let full = {};
      if (hasSupabase && supabase) {
        const { data: dbData, error: fetchErr } = await supabase
          .from('site_settings')
          .select('data')
          .eq('key', key)
          .maybeSingle();

        if (fetchErr) {
          console.error('[HomeAnivEditor] SELECT:', fetchErr);
          throw new Error(fetchErr.message || 'Falha ao ler o banco');
        }
        full = parseSafeJson(dbData?.data) || {};
      } else {
        try {
          const raw = localStorage.getItem(`admac_site_settings:${key}`);
          if (raw) full = parseSafeJson(JSON.parse(raw)) || {};
        } catch { /* ignore */ }
      }

      const payload = { ...full, birthdays: bData };

      if (hasSupabase && supabase) {
        const { error: upErr } = await supabase.from('site_settings').upsert({
          key,
          data: payload,
          updated_at: new Date().toISOString()
        });
        if (upErr) {
          console.error('[HomeAnivEditor] UPSERT:', upErr);
          throw new Error(upErr.message || 'Falha ao gravar no Supabase');
        }
      }

      persistLocal(payload);
      setMsg(hasSupabase ? '✅ Salvo no banco!' : '✅ Salvo no navegador (sem Supabase).');
    } catch (err) {
      console.error('Error saving birthdays:', err);
      try {
        let prev = {};
        try {
          const raw = localStorage.getItem(`admac_site_settings:${key}`);
          if (raw) prev = JSON.parse(raw);
        } catch { /* ignore */ }
        const payload = { ...prev, birthdays: bData };
        persistLocal(payload);
        setMsg(`⚠️ Banco indisponível: salvo só localmente. ${err?.message ? `(${err.message})` : ''}`);
      } catch {
        setMsg(`❌ ${err?.message || 'Erro ao salvar'}`);
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 6000);
    }
  };

  const textareaStyle = { width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 };

  return (
    <div>
      {/* Ministry Selector */}
      <div className="pm-field" style={{ marginBottom: '1.2rem' }}>
        <label>Selecione o Ministério</label>
        <select
          value={selMin}
          onChange={e => setSelMin(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, fontSize: '.9rem', outline: 'none' }}
        >
          {ministryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!bData ? (
        <div style={{ color: palette.textMuted, padding: '1rem' }}>Carregando...</div>
      ) : (
        <>
          <div className="pm-field">
            <label>Título da Seção</label>
            <div className="pm-field-wrap">
              <span className="pm-icon">🎉</span>
              <input className="pm-input" value={bData.title || ''} onChange={e => setBData(d => ({ ...d, title: e.target.value }))} placeholder="Ex: Aniversariantes do Mês" />
            </div>
          </div>
          <div className="pm-field">
            <label>Texto Descritivo</label>
            <textarea value={bData.text || ''} onChange={e => setBData(d => ({ ...d, text: e.target.value }))} style={textareaStyle} />
          </div>
          <div className="pm-field">
            <label>Link do Vídeo (YouTube)</label>
            <div className="pm-field-wrap">
              <span className="pm-icon">▶</span>
              <input className="pm-input" placeholder="https://www.youtube.com/watch?v=..." value={bData.videoUrl || ''} onChange={e => setBData(d => ({ ...d, videoUrl: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem', fontWeight: 600, fontSize: '.9rem', color: palette.text }}>👥 Lista de Aniversariantes</div>
          {(bData.people || []).map((p, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', padding: '1rem', background: palette.surfaceHover, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${palette.accent}`, flexShrink: 0, background: palette.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {p.photo ? <img src={transformImageLink(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <label style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px', border: `1px solid ${palette.accent}` }}>
                  Alterar Foto
                  <button 
                    type="button" 
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} 
                    onClick={() => handleFileUpload((url) => {
                      const next = [...(bData.people || [])];
                      next[idx] = { ...next[idx], photo: url };
                      updatePeople(next);
                    }, hasSupabase, supabase)} 
                  />
                  <span onClick={(e) => {
                    e.preventDefault();
                    handleFileUpload((url) => {
                      const next = [...(bData.people || [])];
                      next[idx] = { ...next[idx], photo: url };
                      updatePeople(next);
                    }, hasSupabase, supabase);
                  }}>Alterar Foto</span>
                </label>
              </div>
              <div className="pm-field">
                <label>Nome</label>
                <div className="pm-field-wrap">
                  <span className="pm-icon">👤</span>
                  <input className="pm-input" value={p.name || ''} onChange={e => {
                    const next = [...(bData.people || [])];
                    next[idx] = { ...next[idx], name: e.target.value };
                    updatePeople(next);
                  }} />
                </div>
              </div>
              <div className="pm-field">
                <label>Data (ex: 15/05)</label>
                <div className="pm-field-wrap">
                  <span className="pm-icon">📅</span>
                  <input className="pm-input" placeholder="DD/MM" value={p.date || ''} onChange={e => {
                    const next = [...(bData.people || [])];
                    next[idx] = { ...next[idx], date: e.target.value };
                    updatePeople(next);
                  }} />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-deletar"
                  onClick={() => {
                    if (currentUser?.role === 'Viewer') {
                      alert('Visualizadores não podem excluir dados.');
                      return;
                    }
                    const next = [...(bData.people || [])];
                    next.splice(idx, 1);
                    updatePeople(next);
                  }}
                  disabled={currentUser?.role === 'Viewer'}
                  style={currentUser?.role === 'Viewer' ? { opacity: .5, cursor: 'not-allowed' } : {}}
                >Excluir</button>
              </div>
            </div>
          ))}
          <button className="pm-add-btn" onClick={() => updatePeople([...(bData.people || []), { name: '', date: '', photo: '' }])}>
            + Adicionar Aniversariante
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="painel-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar Aniversariantes'}
            </button>
            {msg && <span style={{ color: palette.accent, fontWeight: 600 }}>{msg}</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default HomeAnivEditor;