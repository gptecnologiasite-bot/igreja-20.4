// ================================================================
// Header.jsx — Cabeçalho principal do site ADMAC
// Exibe logo, menu de navegação desktop/mobile, redes sociais,
// botão de tema (claro/escuro) e link para a área administrativa.
// Os dados são carregados dinamicamente via SiteContext para performance.
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
import { usePageUpdate } from '../hooks/usePageUpdate';
import { transformImageLink } from '../utils/imageUtils';
import { useSiteData } from '../context/SiteContext';

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
  const { headerData, refreshData } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dropdowns
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

  const [showMedia, setShowMedia] = useState(false);
  const [isMediaFixed, setIsMediaFixed] = useState(false);
  const [mediaTimeout, setMediaTimeout] = useState(null);

  const [showSocial, setShowSocial] = useState(false);
  const [isSocialFixed, setIsSocialFixed] = useState(false);
  const [socialTimeout, setSocialTimeout] = useState(null);

  const [internalTheme, setInternalTheme] = useState(
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') || 'dark')
      : 'dark'
  );

  const currentTheme = useMemo(() => theme || internalTheme, [theme, internalTheme]);

  const handleToggleTheme = useCallback(() => {
    if (typeof toggleTheme === 'function') {
      toggleTheme();
      return;
    }
    const next = currentTheme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    setInternalTheme(next);
  }, [toggleTheme, currentTheme]);

  // Visitor & Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [visitorLiveCount, setVisitorLiveCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Site', text: 'Confira nossos avisos e novidades aqui no sino.', time: '01m atrás', read: false }
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
        const val = typeof data.data === 'object' ? (data.data.value ?? 0) : 0;
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
      if (data?.data && typeof data.data === "object") {
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
      if (!error) setUnreadCount(count || 0);
    } catch (err) {
      console.warn('[Header] Erro ao buscar contagem de mensagens:', err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const msgInterval = setInterval(fetchUnreadCount, 30000);
    
    // Simulação de atividade para o Sino
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
      setNotifications(prev => (prev[0]?.text === newNotif.text) ? prev : [newNotif, ...prev.slice(0, 15)]);
      setHasPagesNotif(true);
      playBellOnce().catch(() => { });
    };

    const firstVisitorTimer = setTimeout(notifyVisitor, 12000);
    const visitorInterval = setInterval(notifyVisitor, 90000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(visitorInterval);
      clearTimeout(firstVisitorTimer);
    };
  }, []);

  useEffect(() => {
    loadVisitorLiveCount();
    loadLastVisit();
    loadVisitorTotal();
    
    const interval = setInterval(() => {
      loadVisitorLiveCount();
      loadVisitorTotal();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Sincronização automática via usePageUpdate
  usePageUpdate(['header'], refreshData);

  // Favicon dinâmico
  useEffect(() => {
    const icon = headerData?.logo?.icon?.trim();
    if (icon && typeof icon === 'string' && (icon.startsWith('data:image') || icon.startsWith('http'))) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = headerData.logo.icon;
    }
  }, [headerData?.logo?.icon]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handlers Dropdowns
  const handleMinistriesMouseEnter = () => {
    if (ministriesTimeout) clearTimeout(ministriesTimeout);
    setShowMinistries(true);
  };
  const handleMinistriesMouseLeave = (e) => {
    if (e.relatedTarget?.closest('.dropdown-menu')) return;
    if (!isMinistriesFixed) {
      const t = setTimeout(() => setShowMinistries(false), 300);
      setMinistriesTimeout(t);
    }
  };
  const toggleMinistries = (e) => {
    e.stopPropagation();
    setIsMinistriesFixed(!isMinistriesFixed);
    setShowMinistries(!isMinistriesFixed);
  };

  const handleMediaMouseEnter = () => {
    if (mediaTimeout) clearTimeout(mediaTimeout);
    setShowMedia(true);
  };
  const handleMediaMouseLeave = (e) => {
    if (e.relatedTarget?.closest('.media-dropdown-menu')) return;
    if (!isMediaFixed) {
      const t = setTimeout(() => setShowMedia(false), 300);
      setMediaTimeout(t);
    }
  };
  const toggleMedia = (e) => {
    e.stopPropagation();
    setIsMediaFixed(!isMediaFixed);
    setShowMedia(!isMediaFixed);
  };

  const handleSocialMouseEnter = () => {
    if (socialTimeout) clearTimeout(socialTimeout);
    setShowSocial(true);
  };
  const handleSocialMouseLeave = (e) => {
    if (e.relatedTarget?.closest('.social-dropdown-menu')) return;
    if (!isSocialFixed) {
      const t = setTimeout(() => setShowSocial(false), 300);
      setSocialTimeout(t);
    }
  };
  const toggleSocial = (e) => {
    e.stopPropagation();
    setIsSocialFixed(!isSocialFixed);
    setShowSocial(!isSocialFixed);
  };

  const handleVisitorBellClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    await loadLastVisit();
    setShowVisitorModal(true);
  };

  const menuMinistries = [
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Mulheres', path: '/mulheres' },
    { name: 'Homens', path: '/homens' },
    { name: 'Lares', path: '/lares' },
    { name: 'Retiros', path: '/retiro' },
    { name: 'Casais', path: '/casais' },
  ];

  const menuMedia = [
    { name: 'Portal de Mídia', path: '/midia' },
    { name: 'Revista Admac', path: '/revista' },
    { name: 'Vídeos & Lives', path: '/midia#video' },
    { name: 'Galeria de Fotos', path: '/midia#galeria' },
  ];

  const menuSocial = [
    { name: 'Ação Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
    { name: 'Missões', path: '/missoes' },
    { name: 'Intercessão', path: '/intercessao' },
  ];

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http') || headerData.logo.icon.startsWith('/')) ? (
                <img src={transformImageLink(headerData.logo.icon.trim())} alt="Logo" />
              ) : (
                <span>{headerData?.logo?.icon || '⛪'}</span>
              )}
            </div>
            <span className="logo-text">{headerData?.logo?.text || 'ADMAC'}</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Início</Link>
          
          {/* Mídia Dropdown */}
          <div className="nav-dropdown" onMouseEnter={handleMediaMouseEnter} onMouseLeave={handleMediaMouseLeave}>
            <button className={`dropdown-trigger ${isMediaFixed ? 'active' : ''}`} onClick={toggleMedia}>
              Mídia <ChevronDown size={14} />
            </button>
            {showMedia && (
              <div className={`dropdown-menu media-dropdown-menu ${isMediaFixed ? 'fixed' : ''}`}>
                {menuMedia.map((link, idx) => (
                  <Link key={idx} to={link.path} className="dropdown-item" onClick={() => {setShowMedia(false); setIsMediaFixed(false);}}>{link.name}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Ministérios Dropdown */}
          <div className="nav-dropdown" onMouseEnter={handleMinistriesMouseEnter} onMouseLeave={handleMinistriesMouseLeave}>
            <button className={`dropdown-trigger ${isMinistriesFixed ? 'active' : ''}`} onClick={toggleMinistries}>
              Ministérios <ChevronDown size={14} />
            </button>
            {showMinistries && (
              <div className={`dropdown-menu ${isMinistriesFixed ? 'fixed' : ''}`}>
                {menuMinistries.map((m, idx) => (
                  <Link key={idx} to={m.path} className="dropdown-item" onClick={() => {setShowMinistries(false); setIsMinistriesFixed(false);}}>{m.name}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Social Dropdown */}
          <div className="nav-dropdown" onMouseEnter={handleSocialMouseEnter} onMouseLeave={handleSocialMouseLeave}>
            <button className={`dropdown-trigger ${isSocialFixed ? 'active' : ''}`} onClick={toggleSocial}>
              Social <ChevronDown size={14} />
            </button>
            {showSocial && (
              <div className={`dropdown-menu social-dropdown-menu ${isSocialFixed ? 'fixed' : ''}`}>
                {menuSocial.map((link, idx) => (
                  <Link key={idx} to={link.path} className="dropdown-item" onClick={() => {setShowSocial(false); setIsSocialFixed(false);}}>{link.name}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/sobre" className="nav-link">Sobre</Link>
          <Link to="/contato" className="nav-link">Contato</Link>
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            {headerData.social?.instagram && (
              <a href={headerData.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            )}
            {headerData.social?.youtube && (
              <a href={headerData.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube"><Youtube size={18} /></a>
            )}
            {headerData.social?.facebook && (
              <a href={headerData.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            )}
            {headerData.social?.phone && (
              <a href={headerData.social.phone.startsWith('http') || headerData.social.phone.startsWith('wa.me') ? (headerData.social.phone.startsWith('http') ? headerData.social.phone : `https://${headerData.social.phone}`) : `tel:${headerData.social.phone.replace(/\D/g, '')}`} aria-label="Telefone">
                <Phone size={18} />
              </a>
            )}
            {headerData.social?.music && (
              <a href={headerData.social.music} target="_blank" rel="noopener noreferrer" aria-label="Música / Podcast"><Music size={18} /></a>
            )}
          </div>

          <button className="theme-toggle" onClick={handleToggleTheme} aria-label="Tema">
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Sino de Notificações */}
          <div className="nav-notification-area" style={{ position: 'relative' }}>
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
                    onClick={() => { setNotifications([]); setHasPagesNotif(false); setShowNotifBox(false); }}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
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

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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

      {/* Menu Mobile */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/" onClick={toggleMenu}>Início</Link>
          
          {/* Mídia Mobile Dropdown */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMedia(!showMedia)}>
              Mídia <ChevronDown size={16} />
            </button>
            {showMedia && (
              <div className="mobile-dropdown-content">
                {menuMedia.map((link, idx) => (
                  <Link key={idx} to={link.path} onClick={toggleMenu}>{link.name}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Ministérios Mobile Dropdown */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMinistries(!showMinistries)}>
              Ministérios <ChevronDown size={16} />
            </button>
            {showMinistries && (
              <div className="mobile-dropdown-content">
                {menuMinistries.map((m, idx) => (
                  <Link key={idx} to={m.path} onClick={toggleMenu}>{m.name}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Social Mobile Dropdown */}
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowSocial(!showSocial)}>
              Social <ChevronDown size={16} />
            </button>
            {showSocial && (
              <div className="mobile-dropdown-content">
                {menuSocial.map((link, idx) => (
                  <Link key={idx} to={link.path} onClick={toggleMenu}>{link.name}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/sobre" onClick={toggleMenu}>Sobre</Link>
          <Link to="/contato" onClick={toggleMenu}>Contato</Link>
          
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
              Área Administrativa
            </Link>
          </div>

          {/* Visit Count / Notification Mobile Sticky Area */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
            <button 
              onClick={(e) => { handleVisitorBellClick(e); }}
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

      {/* Modal de Notificação */}
      {selectedNotif && (
        <div className="notif-modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div
            className="notif-modal-content"
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
              <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', color: '#7c82a0', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
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

      {/* Modal de Visitantes */}
      {showVisitorModal && (
        <div className="visitor-modal-overlay" onClick={() => setShowVisitorModal(false)}>
          <div className="visitor-modal" onClick={e => e.stopPropagation()}>
            <div className="visitor-modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #2a2f45' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Estatísticas de Visitas</h3>
              <button onClick={() => setShowVisitorModal(false)} style={{ background: 'none', border: 'none', color: '#7c82a0', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="visitor-modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <span>{lastVisit?.location || "Localização desconhecida"}</span>
              </div>
              <div style={{ background: '#0a0a0a', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                 {lastVisit?.location ? (
                  <iframe
                    title="Mapa do visitante"
                    loading="lazy"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(lastVisit.location)}&output=embed`}
                  />
                ) : (
                  <span style={{ color: '#7c82a0' }}>Sem dados de mapa</span>
                )}
              </div>
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#7c82a0' }}>Total</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{visitorTotal}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#7c82a0' }}>Online</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{visitorLiveCount}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', gap: '12px' }}>
               <Link
                to="/painel"
                onClick={() => setShowVisitorModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}
              >
                Ver Painel
              </Link>
              <button
                onClick={() => setShowVisitorModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #c19a6b 0%, #8b6b4a 100%)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
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
