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
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Ministries handlers
  const handleMinistriesMouseEnter = () => {
    if (ministriesTimeout) {
      clearTimeout(ministriesTimeout);
      setMinistriesTimeout(null);
    }
    setShowMinistries(true);
  };
  const handleMinistriesMouseLeave = (e) => {
    // Don't close if moving to dropdown menu
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
  const handleMinistryClick = (e) => {
    e.stopPropagation();
    setIsMinistriesFixed(false);
    setShowMinistries(false);
    if (ministriesTimeout) {
      clearTimeout(ministriesTimeout);
      setMinistriesTimeout(null);
    }
  };

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

          {/* Mídia link */}
          <Link to="/midia" className="nav-link">Mídia</Link>

          {/* Revista link */}
          <Link to="/revista" className="nav-link">Revista</Link>

          <Link to="/contato" className="nav-link">Contato</Link>
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            <a href="#"><Instagram size={18} /></a>
            <a href="#"><Youtube size={18} /></a>
            <a href="#"><Facebook size={18} /></a>
            <a href="#"><Phone size={18} /></a>
            <a href="#"><Music size={18} /></a>
            <Link to={'/painel'} title={'Área Administrativa'} aria-label={'Área Administrativa'}>
              <Lock size={18} />
            </Link>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/painel" className="cta-button">
            <Lock size={16} style={{ marginRight: '8px' }} />
            Área Administrativa
          </Link>
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

          <Link to="/midia" onClick={toggleMenu}>Mídia</Link>

          <Link to="/revista" onClick={toggleMenu}>Revista</Link>
          <Link to="/contato" onClick={toggleMenu}>Contato</Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
