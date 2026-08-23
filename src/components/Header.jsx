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
  ChevronDown
} from 'lucide-react';
import '../css/Header.css';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';
import { usePageUpdate } from '../hooks/usePageUpdate';
import { transformImageLink } from '../utils/imageUtils';
import { useSiteData } from '../context/SiteContext';

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

  // Visitor State (sino de avisos agora é o NotificationBell flutuante)
  const [visitorLiveCount, setVisitorLiveCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
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

  useEffect(() => {
    const firstTick = setTimeout(() => {
      loadVisitorLiveCount();
      loadLastVisit();
      loadVisitorTotal();
    }, 0);
    
    const interval = setInterval(() => {
      loadVisitorLiveCount();
      loadVisitorTotal();
    }, 20000);

    return () => {
      clearTimeout(firstTick);
      clearInterval(interval);
    };
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

          {/* Visitantes (sino de avisos agora é o NotificationBell flutuante) */}
          <div className="nav-notification-area" style={{ position: 'relative' }}>
            <span className="nav-visitor-stats">
              <span className="nav-visitor-number">
                {visitorTotal + visitorLiveCount}
              </span>
              <span className="nav-visitor-label">visitas</span>
            </span>
          </div>

          <Link 
            to="/painel" 
            className="admin-cta-button"
            title="Área Administrativa"
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
          >
            <ShieldCheck size={18} />
          </Link>

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

          {/* Visit Count Mobile Sticky Area */}
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
              <span style={{ fontWeight: 850, fontSize: '1.05rem' }}>{visitorTotal + visitorLiveCount}</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>visitas</span>
            </button>
          </div>
        </nav>
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
