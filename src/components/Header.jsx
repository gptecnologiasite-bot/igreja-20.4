import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Phone, Music, Moon, Sun, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import '../css/Header.css';
import DatabaseService from '../services/DatabaseService';

const Header = ({ theme, toggleTheme }) => {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Ministries dropdown state
  const [showMinistries, setShowMinistries] = useState(false);
  const [isMinistriesFixed, setIsMinistriesFixed] = useState(false);
  const [ministriesTimeout, setMinistriesTimeout] = useState(null);

  // Dynamic Header Data
  const [headerData, setHeaderData] = useState(DatabaseService.getHeaderDataDefault());

  React.useEffect(() => {
    DatabaseService.getHeaderData().then(setHeaderData);

    const handleStorageChange = () => {
      DatabaseService.getHeaderData().then(setHeaderData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update favicon if logo icon is an image
  React.useEffect(() => {
    const icon = headerData?.logo?.icon;
    if (icon && typeof icon === 'string' && (icon.startsWith('data:image') || icon.startsWith('http'))) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = headerData.logo.icon;
    }
  }, [headerData.logo.icon]);

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
            <div className="logo-icon">
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.startsWith('data:image') || headerData.logo.icon.startsWith('http')) ? (
                <img src={headerData.logo.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                headerData?.logo?.icon
              )}
            </div>
            <span className="logo-text">{headerData?.logo?.text}</span>
          </Link>
        </div>

        <nav className="desktop-nav">
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}

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

          {/* Dynamic links */}
          {headerData?.menu?.slice(1).map((item, idx) => (
            <Link key={idx} to={item.path} className="nav-link">{item.name}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            {headerData?.social?.instagram && <a href={headerData.social.instagram}><Instagram size={18} /></a>}
            {headerData?.social?.youtube && <a href={headerData.social.youtube}><Youtube size={18} /></a>}
            {headerData?.social?.facebook && <a href={headerData.social.facebook}><Facebook size={18} /></a>}
            {headerData?.social?.phone && <a href={`tel:${headerData.social.phone}`}><Phone size={18} /></a>}
            {headerData?.social?.music && <a href={headerData.social.music}><Music size={18} /></a>}
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/painel" className="cta-button">
            <ShieldCheck size={16} style={{ marginRight: '8px' }} />
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
          {headerData?.menu?.slice(0, 1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}

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

          {headerData?.menu?.slice(1).map((item, idx) => (
            <Link key={idx} to={item.path} onClick={toggleMenu}>{item.name}</Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
