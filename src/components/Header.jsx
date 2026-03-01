// ================================================================
// Header.jsx — Cabeçalho principal do site ADMAC
// Exibe logo, menu de navegação desktop/mobile, redes sociais,
// botão de tema (claro/escuro) e link para a área administrativa.
// Os dados são carregados dinamicamente do DatabaseService e
// atualizados automaticamente ao detectar mudanças no localStorage.
// ================================================================

import React, { useState, useCallback, useMemo } from 'react';
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
import DatabaseService from '../services/DatabaseService';

const Header = ({ theme, toggleTheme }) => {
  // ── Estado do menu mobile ─────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Estado do dropdown de Ministérios ────────────────────────
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

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

  // ── Dados dinâmicos do cabeçalho (carregados do localStorage) ──
  const [headerData, setHeaderData] = useState(DatabaseService.getHeaderDataDefault());

  React.useEffect(() => {
    // Carrega os dados do cabeçalho ao montar o componente
    DatabaseService.getHeaderData().then(setHeaderData);

    // Atualiza quando outra aba ou o painel admin alterar os dados
    const handleStorageChange = () => {
      DatabaseService.getHeaderData().then(setHeaderData);
    };

    // Escuta alterações de outras abas
    window.addEventListener('storage', handleStorageChange);
    // Escuta evento customizado emitido pelo Painel na mesma aba
    window.addEventListener('admac_header', handleStorageChange);

    // Remove os listeners ao desmontar o componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admac_header', handleStorageChange);
    };
  }, []);

  // ── Atualiza o favicon dinamicamente se o logo for uma imagem ──
  React.useEffect(() => {
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

  // ── Lista estática dos ministérios para o dropdown ────────────
  const ministries = [
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Mulheres', path: '/mulheres' },
    { name: 'Homens', path: '/homens' },
    { name: 'Lares', path: '/lares' },
    { name: 'Retiros', path: '/retiro' },
    { name: 'Ação Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
  ];

  return (
    <header className="header">
      <div className="container header-content">

        {/* ── Logo da Igreja ── */}
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              {/* Exibe imagem se o ícone for uma URL ou base64, senão exibe emoji */}
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http')) ? (
                <img src={headerData.logo.icon.trim()} alt="Logo da Igreja" />
              ) : (
                <span>{headerData?.logo?.icon || '⛪'}</span>
              )}
            </div>
            <span className="logo-text">{headerData?.logo?.text}</span>
          </Link>
        </div>

        {/* ── Navegação Desktop ── */}
        <nav className="desktop-nav">
          {/* Primeiro item do menu (geralmente "Início") */}
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}

          {/* Dropdown de Ministérios */}
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
                className="dropdown-menu"
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

          {/* Demais itens dinâmicos do menu */}
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
              <a href={`tel:${headerData.social.phone}`} aria-label="Telefone">
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

          {/* Link para a Área Administrativa */}
          <Link to="/painel" className="cta-button">
            <ShieldCheck size={16} style={{ marginRight: '8px' }} />
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

          {/* Demais itens dinâmicos do menu mobile */}
          {headerData?.menu?.slice(1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}

          {/* Link para área admin no mobile */}
          <Link to="/painel" className="mobile-admin-link" onClick={toggleMenu}>
            <ShieldCheck size={18} style={{ marginRight: '8px' }} />
            Área Administrativa
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
