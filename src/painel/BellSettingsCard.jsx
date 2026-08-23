import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';

/**
 * BellSettingsCard.jsx — Card "Sino de Avisos" das Configurações do painel.
 *
 * Comportamento:
 *   - ON  -> sino aparece no site (com a mensagem salva).
 *   - OFF -> sino some do site e nenhum som toca.
 *   - Alternar o interruptor salva automaticamente no Supabase.
 *
 * Robustez:
 *   - Trava por ref contra cliques duplicados (duplo-fogo).
 *   - Sempre parte do valor real do banco ao montar.
 */

const SETTINGS_KEY = 'site_notification';

const BellSettingsCard = () => {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const busyRef = useRef(false);

  // Carrega o valor real do banco ao montar
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (supabase && hasSupabaseConfigured) {
          const { data: row, error } = await supabase
            .from('site_settings')
            .select('data')
            .eq('key', SETTINGS_KEY)
            .single();
          if (!error && row?.data && alive) {
            const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            setEnabled(d.enabled === true);
            setMessage(typeof d.message === 'string' ? d.message : '');
          }
        }
      } catch { /* usa padrão desligado */ }
      finally { if (alive) setLoaded(true); }
    })();
    return () => { alive = false; };
  }, []);

  const persist = useCallback(async (nextEnabled, nextMessage) => {
    if (busyRef.current) return; // trava anti-duplo-clique
    busyRef.current = true;
    setSaving(true);
    setStatus('Salvando…');
    try {
      const payload = {
        enabled: nextEnabled === true,
        message: (nextMessage || '').trim(),
        updatedAt: new Date().toISOString()
      };
      let ok = false;
      if (supabase && hasSupabaseConfigured) {
        const { error } = await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, data: payload });
        ok = !error;
        if (error) console.warn('[BellSettings] upsert error:', error.message);
      }
      if (!ok) {
        try {
          localStorage.setItem('admac_site_settings:' + SETTINGS_KEY, JSON.stringify(payload));
        } catch { /* ignore */ }
      }
      try { localStorage.setItem('admac_bell_force_refresh', String(Date.now())); } catch { /* ignore */ }
      setEnabled(nextEnabled === true);
      setStatus(ok ? '✅ Salvo! Sino ' + (nextEnabled ? 'ATIVO' : 'DESLIGADO') + ' no site.' : '⚠️ Salvo só neste navegador.');
    } catch {
      setStatus('❌ Erro ao salvar.');
    } finally {
      busyRef.current = false;
      setSaving(false);
      setTimeout(() => setStatus(''), 5000);
    }
  }, []);

  const handleToggle = () => {
    if (!loaded || busyRef.current) return;
    persist(!enabled, message);
  };

  return (
    <div className="painel-card" style={{ maxWidth: 600, marginTop: '1.2rem' }}>
      <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>🔔 Sino de Avisos</h3>
      <p style={{ fontSize: '.75rem', color: '#7c82a0', marginBottom: '1rem' }}>
        ON: o sino aparece no site com sua mensagem. OFF: o sino some e o som para.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', border: '1px solid #2a2f45', borderRadius: 8, marginBottom: '1rem' }}>
        <span style={{ fontSize: '.85rem', fontWeight: 700 }}>
          {!loaded ? '⏳ Carregando…' : enabled ? '🟢 Sino ATIVO no site' : '⚪ Sino desligado'}
        </span>
        <button
          type="button"
          className="bell-toggle-switch"
          role="switch"
          aria-checked={enabled}
          disabled={!loaded || saving}
          title={enabled ? 'Ligado — clique para DESLIGAR' : 'Desligado — clique para LIGAR'}
          onClick={handleToggle}
          style={{
            width: 52,
            height: 28,
            borderRadius: 999,
            border: 'none',
            position: 'relative',
            background: enabled ? '#2e7d32' : '#444',
            transition: 'background .25s ease',
            flexShrink: 0,
            cursor: loaded && !saving ? 'pointer' : 'wait',
            opacity: loaded ? 1 : 0.6,
            padding: 0
          }}
        >
          <span style={{
            position: 'absolute',
            top: 3,
            left: enabled ? 27 : 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,.35)',
            transition: 'left .25s cubic-bezier(.34,1.56,.64,1)'
          }} />
        </button>
      </div>

      <div className="pm-field" style={{ marginBottom: '1rem' }}>
        <label>Mensagem do Aviso</label>
        <textarea
          className="pm-input"
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ex: Culto de consagração domingo às 18h. Venha participar!"
          style={{ resize: 'vertical', width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="pm-btn-save"
          style={{ flex: 1 }}
          disabled={saving || !loaded}
          onClick={() => persist(enabled, message)}
        >
          {saving ? 'Salvando…' : 'Salvar Mensagem'}
        </button>
        <button
          type="button"
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #2a2f45',
            background: 'transparent',
            color: '#e8eaf0',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => persist(!enabled, message)}
          title="Atalho: liga/desliga e salva na hora"
        >
          {enabled ? 'Desligar' : 'Ligar'}
        </button>
      </div>

      {status && (
        <p style={{ fontSize: '.78rem', marginTop: '.6rem', color: status.startsWith('✅') ? '#4caf50' : status.startsWith('❌') ? '#f43f5e' : status.startsWith('⚠️') ? '#d4af37' : '#7c82a0' }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default BellSettingsCard;
