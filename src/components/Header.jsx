// ================================================================
// Header.jsx — Cabeçalho principal do site ADMAC
// Exibe logo, menu de navegação desktop/mobile, redes sociais,
// botão de tema (claro/escuro) e link para a área administrativa.
// Os dados são carregados dinamicamente do DatabaseService e
// atualizados automaticamente ao detectar mudanças no localStorage.
// ================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Youtube,
  Facebook,
  Phone,
  Music,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Bell
} from 'lucide-react';
import '../css/Header.css';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';
import { INITIAL_HEADER_DATA } from '../lib/constants';
import { deepMerge, parseSafeJson, transformImageLink } from '../lib/dbUtils';
import { usePageUpdate } from '../hooks/usePageUpdate';

function playBellOnce() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return Promise.reject(new Error("AudioContext indisponível"));

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    master.connect(ctx.destination);

    const freqs = [880, 1320, 1760];
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(i === 0 ? 0.7 : 0.45, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + i * 0.1);
      o.connect(g);
      g.connect(master);
      return o;
    });

    oscs.forEach((o) => o.start(now));
    oscs.forEach((o, idx) => o.stop(now + 1.7 + idx * 0.05));

    return Promise.resolve()
      .then(() => (ctx.state === "suspended" ? ctx.resume() : undefined))
      .finally(() => {
        setTimeout(() => {
          try { ctx.close(); } catch { /* noop */ }
        }, 2200);
      });
  } catch (e) {
    return Promise.reject(e);
  }
}


const Header = ({ theme, toggleTheme }) => {
  // ── Estado do menu mobile ─────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Estado do dropdown de Ministérios ────────────────────────
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

  // ── Estado do dropdown de Mídia ──────────────────────────────
  const [showMedia, setShowMedia] = useState(false);
  const [isMediaFixed, setIsMediaFixed] = useState(false);
  const [mediaTimeout, setMediaTimeout] = useState(null);

  // ── Estado do dropdown de Social ──────────────────────────────
  const [showSocial, setShowSocial] = useState(false);
  const [isSocialFixed, setIsSocialFixed] = useState(false);
  const [socialTimeout, setSocialTimeout] = useState(null);

  // ── Tema interno (fallback quando `theme` não é recebido via props) ──
  const [internalTheme, setInternalTheme] = useState(
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') || 'dark')
      : 'dark'
  );

  // Usa o tema das props se disponível, senão usa o interno
  const currentTheme = useMemo(() => theme || internalTheme, [theme, internalTheme]);

  // CORREÇÃO: `useCallback` é o hook correto para memorizar funções/handlers.
  // `useMemo` seria usado apenas para valores calculados, não para callbacks.
  const handleToggleTheme = useCallback(() => {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
      return;
    }
    // Alterna o tema internamente se a prop `toggleTheme` não foi passada
    const next = currentTheme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    setInternalTheme(next);
  }, [toggleTheme, currentTheme]);

  // ── Dados dinâmicos do cabeçalho (carregados do Supabase) ──
  const [headerData, setHeaderData] = useState(INITIAL_HEADER_DATA);

  const loadHeaderData = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'header')
        .single();

      if (error) throw error;

      if (dbData?.data) {
        setHeaderData(deepMerge(INITIAL_HEADER_DATA, parseSafeJson(dbData.data)));
        setIsConnected(true);
      } else {
        throw new Error('Dados não encontrados');
      }
    } catch (err) {
      console.warn('[Header] Falha ao carregar dados do Supabase, usando fallback local:', err.message);
      setIsConnected(false);
      const raw = localStorage.getItem('admac_site_settings:header');
      if (raw) {
        try {
          const local = JSON.parse(raw);
          setHeaderData(deepMerge(INITIAL_HEADER_DATA, local));
        } catch {
          setHeaderData(INITIAL_HEADER_DATA);
        }
      } else {
        setHeaderData(INITIAL_HEADER_DATA);
      }
    }
  };

  // ── Estado de notificações de visitantes ──────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Contador e localização dos visitantes ────────────────────
  const [visitorLiveCount, setVisitorLiveCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Painel', text: 'Você agora pode ler avisos e alertas aqui no sino.', time: '01m atrás', read: false }
  ]);
  const [hasPagesNotif, setHasPagesNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [visitorTotal, setVisitorTotal] = useState(0);

  const loadVisitorLiveCount = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) return;

      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("site_logs")
        .select("*", { count: "exact", head: true })
        .eq("action", "visitor_access")
        .gte("created_at", since);

      if (!error) setVisitorLiveCount(count || 0);
    } catch (err) {
      console.warn("[Header] Erro ao carregar visitantes ao vivo:", err.message);
    }
  };

  const loadVisitorTotal = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) return;
      const { data } = await supabase
        .from("site_settings")
        .select("data")
        .eq("key", "visitor_stats")
        .single();

      if (data?.data) {
        const raw = data.data;
        const val = typeof raw === 'object' ? (raw.value ?? 0) : 0;
        setVisitorTotal(Number(val));
      }
    } catch (err) {
      console.warn("[Header] Erro ao carregar total de visitas:", err.message);
    }
  };

  const loadLastVisit = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) return;

      const { data } = await supabase
        .from("site_settings")
        .select("data")
        .eq("key", "last_visit")
        .single();

      if (data && data.data && typeof data.data === "object") {
        setLastVisit(data.data);
      }
    } catch (err) {
      console.warn("[Header] Erro ao carregar last_visit:", err.message);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) return;
      
      const { count, error } = await supabase
        .from('site_messages')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'contact');

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.warn('[Header] Erro ao buscar contagem de visitantes:', err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Atualiza contagem de mensagens a cada 30 segundos
    const msgInterval = setInterval(fetchUnreadCount, 30000);
    
    // Função para simular atividade de visitantes e notificar no sino
    const notifyVisitor = () => {
      const visitorCount = Math.floor(Math.random() * 5) + 1;
      const locations = ['São Paulo / SP', 'Rio de Janeiro / RJ', 'Curitiba / PR', 'Brasília / DF', 'Goiânia / GO'];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const newNotif = {
        id: 'visitor-' + Date.now(),
        title: 'Novos Visitantes',
        text: `Neste momento há ${visitorCount} pessoas de ${loc} visitando o site.`,
        time: 'Agora',
        read: false
      };
      setNotifications(prev => {
        if (prev[0]?.text === newNotif.text) return prev;
        return [newNotif, ...prev.slice(0, 15)];
      });
      setHasPagesNotif(true);
      playBellOnce().catch(() => { });
    };

    // Alerta inicial rápido e depois periódico
    const firstVisitorTimer = setTimeout(notifyVisitor, 10000);
    const visitorInterval = setInterval(notifyVisitor, 60000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(visitorInterval);
      clearTimeout(firstVisitorTimer);
    };
  }, []);


  useEffect(() => {
    loadVisitorLiveCount();
    loadLastVisit();

    let lastTs = null;
    let alive = true;

    const tick = async () => {
      if (!alive) return;
      
      const { data: logs, error } = await supabase
        .from('site_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('❌ [Header] Erro ao buscar logs:', error.message);
        return;
      }

      const lv = logs?.[0];
      if (lv) {
        if (lastTs === null) {
          lastTs = lv.timestamp;
        } else if (new Date(lv.timestamp) > new Date(lastTs)) {
          // Detectamos um novo visitante real!
          const loc = lv.location || 'Brasil';
          const live = (visitorLiveCount || 1);
          
          const newNotif = {
            id: Date.now(),
            title: 'Novos Visitantes',
            text: `Neste momento há ${live} pessoas de ${loc} visitando o site. Clique para saber mais.`,
            time: 'Agora',
            read: false
          };
          setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
          setHasPagesNotif(true);
          playBellOnce().catch(() => {});
          lastTs = lv.timestamp;
          
          // Atualiza o contador de visitantes ao vivo simultaneamente
          loadVisitorLiveCount();
        }
      }
    };

    const interval = setInterval(() => {
      loadVisitorLiveCount();
      loadVisitorTotal();
      tick();
    }, 15000);

    tick();
    loadVisitorTotal();

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    loadHeaderData();
  }, []);

  // Sincronização automática via usePageUpdate
  usePageUpdate(['header'], loadHeaderData);

  // ── Atualiza o favicon dinamicamente se o logo for uma imagem ──
  useEffect(() => {
    const icon = headerData?.logo?.icon?.trim();
    if (icon && typeof icon === 'string' && (icon.includes('data:image') || icon.includes('http'))) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = headerData.logo.icon;
    }
  }, [headerData?.logo?.icon]);

  const [isConnected, setIsConnected] = useState(hasSupabaseConfigured);

  // Alterna o menu mobile aberto/fechado
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // ── Handlers do dropdown de Ministérios ──────────────────────

  // Abre o dropdown ao passar o mouse por cima
  const handleMinistriesMouseEnter = () => {
    if (ministriesTimeout) {
      clearTimeout(ministriesTimeout);
      setMinistriesTimeout(null);
    }
    setShowMinistries(true);
  };

  // Fecha o dropdown com atraso se o mouse sair (evita fechar ao mover para o menu)
  const handleMinistriesMouseLeave = (e) => {
    // Não fecha se o mouse se mover para dentro do dropdown
    if (e.relatedTarget && e.relatedTarget.closest('.dropdown-menu')) {
      return;
    }
    if (!isMinistriesFixed) {
      const timeout = setTimeout(() => {
        setShowMinistries(false);
      }, 300);
      setMinistriesTimeout(timeout);
    }
  };

  // Alterna o estado "fixo" do dropdown ao clicar no botão
  const toggleMinistries = (e) => {
    e.stopPropagation();
    if (isMinistriesFixed) {
      setIsMinistriesFixed(false);
      setShowMinistries(false);
    } else {
      setIsMinistriesFixed(true);
      setShowMinistries(true);
    }
  };

  // Fecha o dropdown ao clicar em um item do menu
  const handleMinistryClick = (e) => {
    e.stopPropagation();
    setIsMinistriesFixed(false);
    setShowMinistries(false);
    if (ministriesTimeout) {
      clearTimeout(ministriesTimeout);
      setMinistriesTimeout(null);
    }
  };

  // ── Handlers do dropdown de Mídia ───────────────────────────

  const handleMediaMouseEnter = () => {
    if (mediaTimeout) {
      clearTimeout(mediaTimeout);
      setMediaTimeout(null);
    }
    setShowMedia(true);
  };

  const handleMediaMouseLeave = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.media-dropdown-menu')) {
      return;
    }
    if (!isMediaFixed) {
      const timeout = setTimeout(() => {
        setShowMedia(false);
      }, 300);
      setMediaTimeout(timeout);
    }
  };

  const toggleMedia = (e) => {
    e.stopPropagation();
    if (isMediaFixed) {
      setIsMediaFixed(false);
      setShowMedia(false);
    } else {
      setIsMediaFixed(true);
      setShowMedia(true);
    }
  };

  const handleMediaClick = (e) => {
    e.stopPropagation();
    setIsMediaFixed(false);
    setShowMedia(false);
    if (mediaTimeout) {
      clearTimeout(mediaTimeout);
      setMediaTimeout(null);
    }
  };

  // ── Handlers do dropdown de Social ───────────────────────────

  const handleSocialMouseEnter = () => {
    if (socialTimeout) {
      clearTimeout(socialTimeout);
      setSocialTimeout(null);
    }
    setShowSocial(true);
  };

  const handleSocialMouseLeave = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.social-dropdown-menu')) {
      return;
    }
    if (!isSocialFixed) {
      const timeout = setTimeout(() => {
        setShowSocial(false);
      }, 300);
      setSocialTimeout(timeout);
    }
  };

  const toggleSocial = (e) => {
    e.stopPropagation();
    if (isSocialFixed) {
      setIsSocialFixed(false);
      setShowSocial(false);
    } else {
      setIsSocialFixed(true);
      setShowSocial(true);
    }
  };

  const handleSocialClick = (e) => {
    e.stopPropagation();
    setIsSocialFixed(false);
    setShowSocial(false);
    if (socialTimeout) {
      clearTimeout(socialTimeout);
      setSocialTimeout(null);
    }
  };

  const handleVisitorBellClick = async (e) => {
    // Mantém o usuário na Home e mostra a notificação com localização.
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);

    await loadLastVisit();
    setShowVisitorModal(true);
  };

  // ── Lista estática dos ministérios para o dropdown ────────────
  const ministries = [
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Mulheres', path: '/mulheres' },
    { name: 'Homens', path: '/homens' },
    { name: 'Lares', path: '/lares' },
    { name: 'Retiros', path: '/retiro' },
    { name: 'Casais', path: '/casais' },
  ];

  const socialLinks = [
    { name: 'Ação Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
    { name: 'Missões', path: '/missoes' },
    { name: 'Intercessão', path: '/intercessao' },
    { name: 'Casais', path: '/casais' },
  ];

  const mediaLinks = [
    { name: 'Portal de Mídia', path: '/midia' },
    { name: 'Revista Admac', path: '/revista' },
    { name: 'Vídeos & Lives', path: '/midia#video' },
    { name: 'Galeria de Fotos', path: '/midia#galeria' },
  ];

  return (
    <header className="header">
      <div className="container header-content">

        {/* ── Logo da Igreja ── */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              {/* Exibe imagem se o ícone for uma URL ou base64, senão exibe emoji */}
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http') || headerData.logo.icon.startsWith('/')) ? (
                <img src={transformImageLink(headerData.logo.icon.trim())} alt="Logo da Igreja" />
              ) : (
                <span>{headerData?.logo?.icon || '⛪'}</span>
              )}
            </div>
            <span className="logo-text">{headerData?.logo?.text}</span>
          </Link>
        </div>

        {/* ── Navegação Desktop ── */}
        <nav className="desktop-nav">
          {/* 1. Início */}
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}

          {/* 2. Dropdown de Mídia */}
          <div
            className="nav-dropdown"
            onMouseEnter={handleMediaMouseEnter}
            onMouseLeave={handleMediaMouseLeave}
          >
            <button
              className={`dropdown-trigger ${isMediaFixed ? 'active' : ''}`}
              onClick={toggleMedia}
              aria-haspopup="true"
              aria-expanded={showMedia}
            >
              Mídia <ChevronDown size={16} />
            </button>
            {showMedia && (
              <div
                className={`dropdown-menu ${isMediaFixed ? 'fixed' : ''} media-dropdown-menu`}
                onMouseEnter={handleMediaMouseEnter}
                onMouseLeave={handleMediaMouseLeave}
              >
                {mediaLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.path}
                    className="dropdown-item"
                    onClick={handleMediaClick}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. Dropdown de Ministérios */}
          <div
            className="nav-dropdown"
            onMouseEnter={handleMinistriesMouseEnter}
            onMouseLeave={handleMinistriesMouseLeave}
          >
            <button
              className={`dropdown-trigger ${isMinistriesFixed ? 'active' : ''}`}
              onClick={toggleMinistries}
              aria-haspopup="true"
              aria-expanded={showMinistries}
            >
              Ministérios <ChevronDown size={16} />
            </button>
            {showMinistries && (
              <div
                className={`dropdown-menu ${isMinistriesFixed ? 'fixed' : ''}`}
                onMouseEnter={handleMinistriesMouseEnter}
                onMouseLeave={handleMinistriesMouseLeave}
              >
                {ministries.map((ministry, idx) => (
                  <Link
                    key={idx}
                    to={ministry.path}
                    className="dropdown-item"
                    onClick={handleMinistryClick}
                  >
                    {ministry.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4. Dropdown de Social */}
          <div
            className="nav-dropdown"
            onMouseEnter={handleSocialMouseEnter}
            onMouseLeave={handleSocialMouseLeave}
          >
            <button
              className={`dropdown-trigger ${isSocialFixed ? 'active' : ''}`}
              onClick={toggleSocial}
              aria-haspopup="true"
              aria-expanded={showSocial}
            >
              Social <ChevronDown size={16} />
            </button>
            {showSocial && (
              <div
                className={`dropdown-menu ${isSocialFixed ? 'fixed' : ''} social-dropdown-menu`}
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
              >
                {socialLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.path}
                    className="dropdown-item"
                    onClick={handleSocialClick}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 5 e 6. Sobre e Contato */}
          {headerData?.menu?.slice(1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}
        </nav>

        {/* ── Ações do cabeçalho (redes sociais, tema, admin) ── */}
        <div className="header-actions">
          <div className="social-icons">
            {/* Links de redes sociais com aria-label para acessibilidade */}
            {headerData?.social?.instagram && (
              <a href={headerData.social.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
              </a>
            )}
            {headerData?.social?.youtube && (
              <a href={headerData.social.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <Youtube size={18} />
              </a>
            )}
            {headerData?.social?.facebook && (
              <a href={headerData.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
              </a>
            )}
            {headerData?.social?.phone && (
              <a href={headerData.social.phone.startsWith('http') || headerData.social.phone.startsWith('wa.me') ? (headerData.social.phone.startsWith('http') ? headerData.social.phone : `https://${headerData.social.phone}`) : `tel:${headerData.social.phone.replace(/\D/g, '')}`} aria-label="Telefone">
                <Phone size={18} />
              </a>
            )}
            {headerData?.social?.music && (
              <a href={headerData.social.music} aria-label="Música / Podcast" target="_blank" rel="noopener noreferrer">
                <Music size={18} />
              </a>
            )}
          </div>

          {/* Botão de alternância de tema claro/escuro */}
          <button className="theme-toggle" onClick={handleToggleTheme} aria-label="Alternar tema">
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notificações de Visitantes (Sino da Foto) */}
          <div className="nav-notification-area">
            <button
              className="nav-notification-btn"
              title={hasPagesNotif ? 'Há novas notificações' : 'Sem novas notificações'}
              onClick={() => {
                setShowNotifBox(!showNotifBox);
                setHasPagesNotif(false);
              }}
            >
              <Bell size={18} color="#fff" />
              {hasPagesNotif && <span className="nav-notification-badge" />}
            </button>

            <span className="nav-visitor-stats">
              <span className="nav-visitor-number">
                {visitorTotal + visitorLiveCount}
              </span>
              <span className="nav-visitor-label">visitas</span>
            </span>

            {showNotifBox && (
              <div className="nav-notif-dropdown" style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 300,
                background: '#1a1d27',
                border: '1px solid #2a2f45',
                borderRadius: 14,
                boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                zIndex: 2000,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', background: '#101218', borderBottom: '1px solid #2a2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Notificações</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#8b84ff', fontSize: '0.7rem', cursor: 'pointer' }}
                    onClick={() => { setNotifications([]); setHasPagesNotif(false); }}
                  >
                    Limpar tudo
                  </button>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#7c82a0', fontSize: '0.8rem' }}>
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(42,47,69,0.5)',
                        cursor: 'pointer',
                        background: n.read ? 'transparent' : 'rgba(108, 99, 255, 0.05)',
                        transition: 'background .2s'
                      }}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setSelectedNotif(n);
                        setShowNotifBox(false);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContext: 'space-between', marginBottom: 4 }}>
                        <b style={{ fontSize: '0.8rem', color: '#8b84ff' }}>{n.title}</b>
                        <span style={{ fontSize: '0.65rem', color: '#7c82a0', marginLeft: 'auto' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#e8eaf0', margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal de Notificação Expandida */}
          {selectedNotif && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
              }}
              onClick={() => setSelectedNotif(null)}
            >
              <div
                style={{
                  background: '#1a1d27',
                  borderRadius: 16,
                  border: '1px solid #2a2f45',
                  width: 'min(400px, 100%)',
                  padding: '24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{selectedNotif.title}</h3>
                  <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', color: '#7c82a0', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>
                <p style={{ color: '#e8eaf0', lineHeight: 1.5 }}>{selectedNotif.text}</p>
                <button
                  onClick={() => setSelectedNotif(null)}
                  style={{
                    marginTop: 16,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #c19a6b 0%, #8b6b4a 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Entendi
                </button>
              </div>
            </div>
          )}

          <Link 
            to="/painel" 
            className="admin-cta-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #c19a6b 0%, #8b6b4a 100%)',
              color: '#fff',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
          >
            <ShieldCheck size={14} />
            Área Administrativa
          </Link>

          {/* Botão hamburguer para menu mobile */}
          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Navegação Mobile ── */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          {/* Primeiro item do menu mobile */}
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}

          {/* Dropdown de Mídia Mobile */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMedia(!showMedia)}>
              Mídia <ChevronDown size={16} />
            </button>
            {showMedia && (
              <div className="mobile-dropdown-content">
                {mediaLinks.map((link, idx) => (
                  <Link key={idx} to={link.path} onClick={() => { handleMediaClick({ stopPropagation: () => { } }); toggleMenu(); }}>
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown de ministérios mobile */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMinistries(!showMinistries)}>
              Ministérios <ChevronDown size={16} />
            </button>
            {showMinistries && (
              <div className="mobile-dropdown-content">
                {ministries.map((ministry, idx) => (
                  <Link key={idx} to={ministry.path} onClick={toggleMenu}>
                    {ministry.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown de Social Mobile */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowSocial(!showSocial)}>
              Social <ChevronDown size={16} />
            </button>
            {showSocial && (
              <div className="mobile-dropdown-content">
                {socialLinks.map((link, idx) => (
                  <Link key={idx} to={link.path} onClick={() => { handleSocialClick({ stopPropagation: () => { } }); toggleMenu(); }}>
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Demais itens dinâmicos do menu mobile */}
          {headerData?.menu?.slice(1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}

          <div className="mobile-admin-wrap" style={{ padding: '12px' }}>
            <Link 
              to="/painel" 
              className="mobile-admin-link" 
              onClick={toggleMenu} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px', 
                background: 'linear-gradient(135deg, #c19a6b 0%, #8b6b4a 100%)', 
                borderRadius: '50px', 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: 700,
                fontSize: '.85rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              <ShieldCheck size={16} />
              Área Administrativa
            </Link>
          </div>

          {/* Sino de Notificações Mobile */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
            <button 
              onClick={() => { setShowNotifBox(!showNotifBox); setHasPagesNotif(false); }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                color: '#fff', 
                background: '#0a0a0a',
                padding: '10px 20px',
                borderRadius: '30px',
                border: '2px solid #d4af37',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <Bell size={20} />
              {hasPagesNotif && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  background: '#f43f5e',
                  borderRadius: '50%',
                  border: '2px solid #0a0a0a'
                }} />
              )}
              <span style={{ fontWeight: 850, fontSize: '1.05rem' }}>{visitorTotal + visitorLiveCount}</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>visitas</span>
            </button>
          </div>
        </nav>
      )}

      {showVisitorModal && (
        <div
          className="visitor-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowVisitorModal(false)}
        >
          <div className="visitor-modal" onClick={(evt) => evt.stopPropagation()}>
            <div className="visitor-modal-header">
              <div style={{ fontWeight: 800 }}>Onde você está acessando</div>
              <button
                type="button"
                className="visitor-modal-close"
                aria-label="Fechar"
                onClick={() => setShowVisitorModal(false)}
              >
                ×
              </button>
            </div>

            <div className="visitor-modal-body">
              <div className="visitor-modal-location">
                <span style={{ fontWeight: 700 }}>📍</span>{" "}
                <span>{lastVisit?.location || "Visitante Anônimo"}</span>
              </div>

              <div className="visitor-modal-map">
                {lastVisit?.location ? (
                  <iframe
                    title="Mapa do visitante"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(lastVisit.location)}&output=embed`}
                  />
                ) : (
                  <div className="visitor-modal-empty">Sem dados de localização agora.</div>
                )}
              </div>
            </div>

            <div className="visitor-modal-actions">
              <Link
                to="/painel"
                className="visitor-modal-open-panel"
                onClick={() => setShowVisitorModal(false)}
              >
                Ver Painel
              </Link>
              <button
                type="button"
                className="visitor-modal-close-btn"
                onClick={() => setShowVisitorModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
