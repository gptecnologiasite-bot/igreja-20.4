// ================================================================
// Header.jsx — Cabeçalho principal do site ADMAC
// Exibe logo, menu de navegação desktop/mobile, redes sociais,
// botão de tema (claro/escuro) e link para a área administrativa.
// Os dados são carregados dinamicamente do DatabaseService e
// atualizados automaticamente ao detectar mudanças no localStorage.
// ================================================================

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import '../css/Header.css';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';
import { INITIAL_HEADER_DATA } from '../lib/constants';
import { deepMerge, parseSafeJson, transformImageLink } from '../lib/dbUtils';
import { usePageUpdate } from '../hooks/usePageUpdate';

const locations = ['São Paulo / SP', 'Rio de Janeiro / RJ', 'Goiânia / GO', 'Brasília / DF', 'Belo Horizonte / MG', 'Curitiba / PR', 'Salvador / BA'];

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

  // ── Estado do cabeçalho (redes sociais, tema, admin) ──
  const [visitorCount, setVisitorCount] = useState(0);
  const prevVisitorCount = useRef(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Painel', text: 'Você agora pode ler avisos e alertas aqui no sino.', time: '01m atrás', read: false }
  ]);
  const [isConnected, setIsConnected] = useState(hasSupabaseConfigured);

  const playBellSound = useCallback((location = null) => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('Audio play blocked by browser policy. Click anywhere to enable.'));
      
      // Adiciona uma nova notificação de visitante (usa localização real se disponível)
      const finalLoc = location || locations[Math.floor(Math.random() * locations.length)];
      const newNotif = {
        id: Date.now(),
        title: 'Novo Visitante',
        text: `Neste momento há 1 pessoa de ${finalLoc} visitando o site. Clique para saber mais.`,
        time: 'Agora',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Mantém as últimas 10
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  }, []);

  const checkVisitors = useCallback(async () => {
    try {
      // 1. Check total count
      const { data: statsData } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'visitor_stats')
        .single();

      if (statsData && statsData.data && typeof statsData.data.value === 'number') {
        const newCount = statsData.data.value;
        prevVisitorCount.current = newCount;
        setVisitorCount(newCount);
      }

      // 2. Fetch last visit to populate initial notifications
      const { data: lastVisitData } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'last_visit')
        .single();
      
      if (lastVisitData && lastVisitData.data && lastVisitData.data.location) {
        // Se já houver uma visita recente no banco, pode inicializar a lista com ela
      }
    } catch (err) {
      console.warn('[Header] Falha ao verificar visitantes:', err.message);
    }
  }, []);

  useEffect(() => {
    // Inicializa o contador
    checkVisitors();

    // Configura o Realtime do Supabase para monitorar a tabela site_settings
    const channel = supabase
      .channel('visitor_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          // Monitora atualizações no contador total
          if (payload.new && payload.new.key === 'visitor_stats') {
            const newCount = payload.new.data?.value;
            if (newCount !== undefined) setVisitorCount(newCount);
          }
          
          // Monitora atualizações de visitas individuais (Sino e Notificação de Localização)
          if (payload.new && payload.new.key === 'last_visit') {
            const loc = payload.new.data?.location;
            if (loc) {
              playBellSound(loc);
            }
          }
        }
      )
      .subscribe();

    // Polling de segurança a cada 2 minutos
    const interval = setInterval(checkVisitors, 120000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [checkVisitors, playBellSound]);

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

  // ── Lista estática dos ministérios para o dropdown ────────────
  const ministries = [
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Mulheres', path: '/mulheres' },
    { name: 'Homens', path: '/homens' },
    { name: 'Lares', path: '/lares' },
    { name: 'Retiros', path: '/retiro' },
  ];

  const socialLinks = [
    { name: 'Ação Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
    { name: 'Missões', path: '/missoes' },
    { name: 'Intercessão', path: '/intercessao' },
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

          {/* Link para a Área Administrativa com ícone de sino e contador */}
          <div className="admin-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <div 
              className="visitor-bell" 
              title={`${visitorCount} visitas registradas`} 
              style={{ color: '#f1c40f', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '4px' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              {visitorCount > 0 && <span style={{ fontSize: '.75rem', fontWeight: 700 }}>{visitorCount}</span>}
            </div>

            {/* Caixa de Notificações */}
            {showNotifications && (
              <div 
                className="notifications-popover" 
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  backgroundColor: '#1a1d27',
                  border: '1px solid #2a2f45',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f1117' }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#e8eaf0' }}>Notificações</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#8b84ff', fontSize: '.75rem', cursor: 'pointer' }}
                    onClick={() => setNotifications([])}
                  >
                    Limpar tudo
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#7c82a0', fontSize: '.85rem' }}>
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid #2a2f45', 
                        cursor: 'pointer',
                        background: n.read ? 'transparent' : 'rgba(108, 99, 255, 0.05)',
                        transition: 'background .2s'
                      }}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '.85rem', color: '#8b84ff' }}>{n.title}</span>
                        <span style={{ fontSize: '.7rem', color: '#7c82a0' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '.8rem', color: '#e8eaf0', margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/painel" className="cta-button" style={{ position: 'relative' }}>
              <ShieldCheck size={16} style={{ marginRight: '8px' }} />
              Área Administrativa
              {/* Indicador de Conexão */}
              <span 
                title={isConnected ? "Conectado ao Supabase" : "Desconectado do Supabase"}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#22c55e' : '#ef4444',
                  border: '2px solid var(--surface)',
                  boxShadow: isConnected ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)'
                }} 
              />
            </Link>
          </div>

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

          {/* Link para área admin no mobile com sino */}
          <div className="mobile-admin-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link to="/painel" className="mobile-admin-link" onClick={toggleMenu} style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: '#22c55e', textDecoration: 'none', fontWeight: 600, position: 'relative' }}>
                <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                Área Administrativa
                <span 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isConnected ? '#22c55e' : '#ef4444'
                  }} 
                />
              </Link>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                style={{ marginLeft: '10px', background: 'rgba(241, 196, 15, 0.1)', border: 'none', borderRadius: '8px', padding: '10px', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <span>🔔</span>
                {visitorCount > 0 && <span style={{ fontSize: '.8rem', fontWeight: 700 }}>{visitorCount}</span>}
              </button>
            </div>

            {/* Notificações Mobile */}
            {showNotifications && (
              <div style={{ background: '#1a1d27', border: '1px solid #2a2f45', borderRadius: '8px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #2a2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f1117' }}>
                  <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Notificações</span>
                  <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#8b84ff', fontSize: '.7rem' }}>Limpar</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#7c82a0', fontSize: '.8rem' }}>Sem notificações</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #2a2f45', background: n.read ? 'transparent' : 'rgba(108, 99, 255, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '.8rem', color: '#8b84ff' }}>{n.title}</span>
                        <span style={{ fontSize: '.65rem', color: '#7c82a0' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '.75rem', color: '#e8eaf0', margin: 0 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
