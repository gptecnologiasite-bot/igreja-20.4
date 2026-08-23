import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';

/**
 * NotificationBell.jsx — Sino de avisos do site.
 *
 * Admin controla (painel > Configurações > Sino de Avisos):
 *   - enabled (ON/OFF) e a mensagem do aviso, salvos em site_settings.key = 'site_notification'.
 *
 * Visitante:
 *   - Vê o sino flutuante quando há aviso ativo.
 *   - Clica no sino para ler o aviso e ESCOLHER se quer ouvir o som (ligar/desligar).
 *   - A escolha de som fica salva no navegador (localStorage).
 */

const PREFS_KEY = 'admac_bell_prefs';
const SEEN_KEY = 'admac_bell_seen_at';

const loadPrefs = () => {
  try {
    return { sound: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { sound: true };
  }
};

/** Toca um sino suave (duas notas) via Web Audio API — sem arquivos de áudio. */
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [880, 1174.66]; // Lá5 e Ré6 — timbre de sininho
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.2);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch { /* áudio indisponível — ignora silenciosamente */ }
};

const NotificationBell = () => {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [soundOn, setSoundOn] = useState(loadPrefs().sound);
  const lastSeenRef = useRef(localStorage.getItem(SEEN_KEY) || '');

  const applyNotification = useCallback((parsed) => {
    if (!parsed || typeof parsed !== 'object') return;
    setData(parsed);
    const active = parsed.enabled === true && Boolean((parsed.message || '').trim());
    setUnread(active && Boolean(parsed.updatedAt) && parsed.updatedAt !== lastSeenRef.current);
    if (active && parsed.updatedAt && parsed.updatedAt !== lastSeenRef.current) {
      if (loadPrefs().sound) playChime();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchNotification = async () => {
      try {
        let payload = null;
        if (hasSupabaseConfigured) {
          const { data: rows } = await supabase
            .from('site_settings')
            .select('data')
            .eq('key', 'site_notification')
            .single();
          payload = rows?.data ?? null;
        }
        if (!payload) {
          const cached = localStorage.getItem('admac_site_settings:site_notification');
          if (cached) payload = JSON.parse(cached);
        } else {
          localStorage.setItem('admac_site_settings:site_notification', JSON.stringify(payload));
        }
        if (!cancelled) applyNotification(typeof payload === 'string' ? JSON.parse(payload) : payload);
      } catch { /* offline — mantém estado atual */ }
    };

    fetchNotification();
    const timer = setInterval(fetchNotification, 20000);

    // Sincronização instantânea: painel salvou em outra aba -> atualiza já
    const onStorage = (e) => {
      if (e.key === 'admac_bell_force_refresh' || e.key === 'admac_site_settings:site_notification') {
        fetchNotification();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchNotification();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [applyNotification]);

  if (!data || data.enabled !== true || !(data.message || '').trim()) return null;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify({ sound: next }));
    if (next) playChime();
  };

  const markAsRead = () => {
    lastSeenRef.current = data.updatedAt || '';
    localStorage.setItem(SEEN_KEY, lastSeenRef.current);
    setUnread(false);
  };

  return (
    <div className="bell-widget">
      <button
        className={`bell-float-btn ${unread ? 'has-unread' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Sino de avisos"
        title="Avisos da igreja"
      >
        <span className="bell-icon">🔔</span>
        {unread && <span className="bell-badge" />}
      </button>

      {open && (
        <div className="bell-popup" role="dialog" aria-label="Aviso da igreja">
          <div className="bell-popup-header">
            <span>📢 Aviso da Igreja</span>
            <button className="bell-close" onClick={() => setOpen(false)} aria-label="Fechar">✕</button>
          </div>
          <p className="bell-message">{data.message}</p>
          <div className="bell-popup-footer">
            <button
              className={`bell-sound-toggle ${soundOn ? 'on' : 'off'}`}
              onClick={toggleSound}
              title="Escolha se quer ouvir o sino"
            >
              {soundOn ? '🔊 Som ligado' : '🔇 Som desligado'}
            </button>
            {unread && (
              <button className="bell-read-btn" onClick={markAsRead}>
                Marcar como lida
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
