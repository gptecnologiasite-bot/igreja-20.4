import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Phone, Music, Moon, Sun, Menu, X, Lock, ChevronDown } from 'lucide-react';
import '../css/Header.css';

const Header = ({ theme, toggleTheme }) => {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Ministries dropdown state
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  // Media dropdown state
  const [showMedia, setShowMedia] = useState(false);
  const [isMediaFixed, setIsMediaFixed] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Ministries handlers
  const handleMinistriesMouseEnter = () => setShowMinistries(true);
  const handleMinistriesMouseLeave = () => {
    if (!isMinistriesFixed) setShowMinistries(false);
  };
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

  // Media handlers
  const handleMediaMouseEnter = () => setShowMedia(true);
  const handleMediaMouseLeave = () => {
    if (!isMediaFixed) setShowMedia(false);
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

  const ministries = [
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Mulheres', path: '/mulheres' },
    { name: 'Lares', path: '/lares' },
    { name: 'Retiros', path: '/retiro' },
    { name: 'Ação Social', path: '/social' },
    { name: 'EBD', path: '/edb' },
  ];

  const mediaPages = [
    { name: 'Live', path: '/midia/live' },
    { name: 'Vídeos', path: '/midia/videos' },
  ];

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">✝</div>
            <span className="logo-text">ADMAC</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>

          {/* Ministries dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={handleMinistriesMouseEnter}
            onMouseLeave={handleMinistriesMouseLeave}
          >
            <button
              className={`dropdown-trigger ${isMinistriesFixed ? 'active' : ''}`}
              onClick={toggleMinistries}
            >
              Ministérios <ChevronDown size={16} />
            </button>
            {showMinistries && (
              <div className="dropdown-menu">
                {ministries.map((ministry, idx) => (
                  <Link key={idx} to={ministry.path} className="dropdown-item">
                    {ministry.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Media dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={handleMediaMouseEnter}
            onMouseLeave={handleMediaMouseLeave}
          >
            <button
              className={`dropdown-trigger ${isMediaFixed ? 'active' : ''}`}
              onClick={toggleMedia}
            >
              Mídia <ChevronDown size={16} />
            </button>
            {showMedia && (
              <div className="dropdown-menu">
                {mediaPages.map((page, idx) => (
                  <Link key={idx} to={page.path} className="dropdown-item">
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Revista link */}
          <Link to="/revista" className="nav-link">Revista</Link>

          <Link to="/contact" className="nav-link">Contato</Link>
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            <a href="#"><Instagram size={18} /></a>
            <a href="#"><Youtube size={18} /></a>
            <a href="#"><Facebook size={18} /></a>
            <a href="#"><Phone size={18} /></a>
            <a href="#"><Music size={18} /></a>
            <Link to="/login" title="Área Administrativa"><Lock size={18} /></Link>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="cta-button">
            <Phone size={16} style={{ marginRight: '8px' }} />
            Pedido de Oração
          </button>
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          <Link to="/" onClick={toggleMenu}>Home</Link>

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

          <div className="mobile-dropdown">
            <button className="mobile-dropdown-trigger" onClick={() => setShowMedia(!showMedia)}>
              Mídia <ChevronDown size={16} />
            </button>
            {showMedia && (
              <div className="mobile-dropdown-content">
                {mediaPages.map((page, idx) => (
                  <Link key={idx} to={page.path} onClick={toggleMenu}>
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/revista" onClick={toggleMenu}>Revista</Link>
          <Link to="/contact" onClick={toggleMenu}>Contato</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
