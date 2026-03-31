// ================================================================
// Header.jsx ÔÇö Cabe├ºalho principal do site ADMAC
// Exibe logo, menu de navega├º├úo desktop/mobile, redes sociais,
// bot├úo de tema (claro/escuro) e link para a ├írea administrativa.
// Os dados s├úo carregados dinamicamente do DatabaseService e
// atualizados automaticamente ao detectar mudan├ºas no localStorage.
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
    if (!AudioCtx) return Promise.reject(new Error("AudioContext indispon├¡vel"));

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
  // ÔöÇÔöÇ Estado do menu mobile ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ÔöÇÔöÇ Estado do dropdown de Minist├®rios ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

  // ÔöÇÔöÇ Estado do dropdown de M├¡dia ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [showMedia, setShowMedia] = useState(false);
  const [isMediaFixed, setIsMediaFixed] = useState(false);
  const [mediaTimeout, setMediaTimeout] = useState(null);

  // ÔöÇÔöÇ Estado do dropdown de Social ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [showSocial, setShowSocial] = useState(false);
  const [isSocialFixed, setIsSocialFixed] = useState(false);
  const [socialTimeout, setSocialTimeout] = useState(null);

  // ÔöÇÔöÇ Tema interno (fallback quando `theme` n├úo ├® recebido via props) ÔöÇÔöÇ
  const [internalTheme, setInternalTheme] = useState(
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') || 'dark')
      : 'dark'
  );

  // Usa o tema das props se dispon├¡vel, sen├úo usa o interno
  const currentTheme = useMemo(() => theme || internalTheme, [theme, internalTheme]);

  // CORRE├ç├âO: `useCallback` ├® o hook correto para memorizar fun├º├Áes/handlers.
  // `useMemo` seria usado apenas para valores calculados, n├úo para callbacks.
  const handleToggleTheme = useCallback(() => {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
      return;
    }
    // Alterna o tema internamente se a prop `toggleTheme` n├úo foi passada
    const next = currentTheme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    setInternalTheme(next);
  }, [toggleTheme, currentTheme]);

  // ÔöÇÔöÇ Dados din├ómicos do cabe├ºalho (carregados do Supabase) ÔöÇÔöÇ
  const [headerData, setHeaderData] = useState(INITIAL_HEADER_DATA);

  const loadHeaderData = async () => {
    try {
      if (!supabase || !hasSupabaseConfigured) {
        throw new Error('Supabase n├úo configurado');
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
        throw new Error('Dados n├úo encontrados');
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

  // ÔöÇÔöÇ Estado de notifica├º├Áes de visitantes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [unreadCount, setUnreadCount] = useState(0);

  // ÔöÇÔöÇ Contador e localiza├º├úo dos visitantes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const [visitorLiveCount, setVisitorLiveCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Painel', text: 'Voc├¬ agora pode ler avisos e alertas aqui no sino.', time: '01m atr├ís', read: false }
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
    
    // Fun├º├úo para simular atividade de visitantes e notificar no sino
    const notifyVisitor = () => {
      const visitorCount = Math.floor(Math.random() * 5) + 1;
      const locations = ['S├úo Paulo / SP', 'Rio de Janeiro / RJ', 'Curitiba / PR', 'Bras├¡lia / DF', 'Goi├ónia / GO'];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const newNotif = {
        id: 'visitor-' + Date.now(),
        title: 'Novos Visitantes',
        text: `Neste momento h├í ${visitorCount} pessoas de ${loc} visitando o site.`,
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

    // Alerta inicial r├ípido e depois peri├│dico
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
        console.warn('ÔØî [Header] Erro ao buscar logs:', error.message);
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
            text: `Neste momento h├í ${live} pessoas de ${loc} visitando o site. Clique para saber mais.`,
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

  // Sincroniza├º├úo autom├ítica via usePageUpdate
  usePageUpdate(['header'], loadHeaderData);

  // ÔöÇÔöÇ Atualiza o favicon dinamicamente se o logo for uma imagem ÔöÇÔöÇ
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

  // ÔöÇÔöÇ Handlers do dropdown de Minist├®rios ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

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
    // N├úo fecha se o mouse se mover para dentro do dropdown
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

  // Alterna o estado "fixo" do dropdown ao clicar no bot├úo
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

  // ÔöÇÔöÇ Handlers do dropdown de M├¡dia ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

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

  // ÔöÇÔöÇ Handlers do dropdown de Social ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

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
    // Mant├®m o usu├írio na Home e mostra a notifica├º├úo com localiza├º├úo.
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);

    await loadLastVisit();
    setShowVisitorModal(true);
  };

  // ÔöÇÔöÇ Lista est├ítica dos minist├®rios para o dropdown ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
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
    { name: 'A├º├úo Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
    { name: 'Miss├Áes', path: '/missoes' },
    { name: 'Intercess├úo', path: '/intercessao' },
    { name: 'Casais', path: '/casais' },
  ];

  const mediaLinks = [
    { name: 'Portal de M├¡dia', path: '/midia' },
    { name: 'Revista Admac', path: '/revista' },
    { name: 'V├¡deos & Lives', path: '/midia#video' },
    { name: 'Galeria de Fotos', path: '/midia#galeria' },
  ];

  return (
    <header className="header">
      <div className="container header-content">

        {/* ÔöÇÔöÇ Logo da Igreja ÔöÇÔöÇ */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              {/* Exibe imagem se o ├¡cone for uma URL ou base64, sen├úo exibe emoji */}
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http') || headerData.logo.icon.startsWith('/')) ? (
                <img src={transformImageLink(headerData.logo.icon.trim())} alt="Logo da Igreja" />
              ) : (
                <span>{headerData?.logo?.icon || 'Ôø¬'}</span>
              )}
            </div>
            <span className="logo-text">{headerData?.logo?.text}</span>
          </Link>
        </div>

        {/* ÔöÇÔöÇ Navega├º├úo Desktop ÔöÇÔöÇ */}
        <nav className="desktop-nav">
          {/* 1. In├¡cio */}
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}

          {/* 2. Dropdown de M├¡dia */}
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
              M├¡dia <ChevronDown size={16} />
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

          {/* 3. Dropdown de Minist├®rios */}
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
              Minist├®rios <ChevronDown size={16} />
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

        {/* ÔöÇÔöÇ A├º├Áes do cabe├ºalho (redes sociais, tema, admin) ÔöÇÔöÇ */}
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
              <a href={headerData.social.music} aria-label="M├║sica / Podcast" target="_blank" rel="noopener noreferrer">
                <Music size={18} />
              </a>
            )}
          </div>

          {/* Bot├úo de altern├óncia de tema claro/escuro */}
          <button className="theme-toggle" onClick={handleToggleTheme} aria-label="Alternar tema">
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifica├º├Áes de Visitantes (Sino da Foto) */}
          <div className="nav-notification-area">
            <button
              className="nav-notification-btn"
              title={hasPagesNotif ? 'H├í novas notifica├º├Áes' : 'Sem novas notifica├º├Áes'}
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
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Notifica├º├Áes</span>
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
                      Nenhuma notifica├º├úo por enquanto.
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

          {/* Modal de Notifica├º├úo Expandida */}
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
                  <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', color: '#7c82a0', fontSize: '1.2rem', cursor: 'pointer' }}>Ô£ò</button>
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
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
          >
            <ShieldCheck size={14} />
            ├ürea Administrativa
          </Link>

          {/* Bot├úo hamburguer para menu mobile ÔÇö posicionado fixo quando aberto para f├ícil fechamento */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`} 
            onClick={toggleMenu} 
            aria-label="Menu"
            style={isMenuOpen ? { position: 'fixed', right: '2rem', top: '1.5rem', zIndex: 1200 } : {}}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Overlay/Backdrop para o menu mobile */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050
          }}
        />
      )}

      {/* ÔöÇÔöÇ Navega├º├úo Mobile ÔöÇÔöÇ */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          {/* Primeiro item do menu mobile */}
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}

          {/* Dropdown de M├¡dia Mobile */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMedia(!showMedia)}>
              M├¡dia <ChevronDown size={16} />
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

          {/* Dropdown de minist├®rios mobile */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMinistries(!showMinistries)}>
              Minist├®rios <ChevronDown size={16} />
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

          {/* Demais itens din├ómicos do menu mobile */}
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
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', 
                borderRadius: '50px', 
                color: '#ffffff', 
                textDecoration: 'none', 
                fontWeight: 700,
                fontSize: '.85rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              <ShieldCheck size={16} />
              ├ürea Administrativa
            </Link>
          </div>

          {/* Sino de Notifica├º├Áes Mobile */}
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
              <div style={{ fontWeight: 800 }}>Onde voc├¬ est├í acessando</div>
              <button
                type="button"
                className="visitor-modal-close"
                aria-label="Fechar"
                onClick={() => setShowVisitorModal(false)}
              >
                ├ù
              </button>
            </div>

            <div className="visitor-modal-body">
              <div className="visitor-modal-location">
                <span style={{ fontWeight: 700 }}>­ƒôì</span>{" "}
                <span>{lastVisit?.location || "Visitante An├┤nimo"}</span>
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
                  <div className="visitor-modal-empty">Sem dados de localiza├º├úo agora.</div>
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
