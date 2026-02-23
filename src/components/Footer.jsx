import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Phone, Music, Mail, MapPin, Clock, Heart, ChevronRight } from 'lucide-react';
import '../css/Footer.css';
import DatabaseService from '../services/DatabaseService';

const Footer = () => {
  const [footerData, setFooterData] = React.useState(DatabaseService.getFooterDataDefault());
  const [headerData, setHeaderData] = React.useState(DatabaseService.getHeaderDataDefault());

  React.useEffect(() => {
    DatabaseService.getFooterData().then(setFooterData);
    DatabaseService.getHeaderData().then(setHeaderData);

    const handleStorageChange = () => {
      DatabaseService.getFooterData().then(setFooterData);
      DatabaseService.getHeaderData().then(setHeaderData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const quickLinks = [
    { name: 'Início', path: '/' },
    { name: 'Ministérios', path: '/ministerios' },
    { name: 'Revista', path: '/revista' },
    { name: 'Contato', path: '/contato' }
  ];

  const ministries = [
    { name: 'Lares', path: '/lares' },
    { name: 'Louvor', path: '/louvor' },
    { name: 'Kids', path: '/kids' },
    { name: 'Jovens', path: '/jovens' },
    { name: 'Missões', path: '/missoes' },
    { name: 'Intercessão', path: '/intercessao' }
  ];

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="container footer-content">
        {/* About Section */}
        <div className="footer-section">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.startsWith('data:image') || headerData.logo.icon.startsWith('http')) ? (
                <img src={headerData.logo.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                headerData?.logo?.icon || footerData?.logo?.text?.substring(0, 2)
              )}
            </div>
            <div>
              <h3>{footerData?.logo?.text}</h3>
              <p className="footer-tagline">{footerData?.logo?.tagline}</p>
            </div>
          </div>
          <p className="footer-description">
            {footerData?.description}
          </p>
          <div className="footer-verse">
            <Heart size={16} />
            <span>{footerData?.verse}</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <ul className="footer-links">
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path}>
                  <ChevronRight size={14} />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ministries */}
        <div className="footer-section">
          <h4>Ministérios</h4>
          <ul className="footer-links">
            {ministries.map((ministry, index) => (
              <li key={index}>
                <Link to={ministry.path}>
                  <ChevronRight size={14} />
                  {ministry.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contato</h4>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{footerData?.contact?.address}</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href={`tel:${footerData?.contact?.phone}`}>
                {footerData?.contact?.phone}
              </a>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <a href={`mailto:${footerData?.contact?.email}`}>
                {footerData?.contact?.email}
              </a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Cultos: {footerData?.contact?.cultos}</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="footer-social">
            <h4>Redes Sociais</h4>
            <div className="social-links">
              {footerData?.social?.instagram && (
                <a href={footerData.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <Instagram size={20} />
                </a>
              )}
              {footerData?.social?.youtube && (
                <a href={footerData.social.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                  <Youtube size={20} />
                </a>
              )}
              {footerData?.social?.facebook && (
                <a href={footerData.social.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <Facebook size={20} />
                </a>
              )}
              {footerData?.social?.spotify && (
                <a href={footerData.social.spotify} target="_blank" rel="noopener noreferrer" className="social-link spotify">
                  <Music size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {new Date().getFullYear()} {footerData?.logo?.text} - Assembleia de Deus Ministério Atos e Conquistas. Todos os direitos reservados.</p>
            <p className="footer-credits">
              Desenvolvido com <Heart size={14} className="heart-icon" /> pela equipe {footerData?.logo?.text}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
