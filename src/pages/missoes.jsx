import { Globe, Users, Heart, MapPin, Send, Calendar, DollarSign, Play, Target, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Lares.css';
import DatabaseService from '../services/DatabaseService';

const Missoes = () => {
  const [donation, setDonation] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    frequency: 'once',
    missionary: 'geral'
  });

  const [data, setData] = useState(DatabaseService.getMinistryDefault('missoes'));

  useEffect(() => {
    DatabaseService.getMinistry('missoes').then(ministryData => {
      if (ministryData) setData(ministryData);
    });

    const handleStorageChange = () => {
      DatabaseService.getMinistry('missoes').then(ministryData => {
        if (ministryData) setData(ministryData);
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Obrigado pela sua contribuição! Em breve entraremos em contato com os detalhes para a doação.');
    setDonation({ 
      name: '', 
      email: '', 
      phone: '', 
      amount: '', 
      frequency: 'once', 
      missionary: 'geral' 
    });
  };

  return (
    <div className="lares-page">
      {/* Hero Section */}
      <div className="lares-hero" style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80)',
        backgroundBlendMode: 'overlay'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Globe size={80} className="hero-icon" />
          <h1>{data.hero.title}</h1>
          <p className="hero-subtitle">{data.hero.subtitle}</p>
          <div className="hero-verse">
            <p>{data.hero.verse}</p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{data.mission.title}</h2>
          <p className="mission-text">
            {data.mission.text}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" style={{ background: 'var(--nav-bg)', padding: '4rem 0' }}>
        <div className="container">
          <div className="stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem'
          }}>
            {data.stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                transition: 'transform 0.3s ease'
              }}>
                <stat.icon size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {stat.number}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      {data.hero.videoUrl && (
        <section className="video-section">
          <div className="container">
            <div className="section-header">
              <Play size={32} />
              <h2>Conheça o Ministério</h2>
            </div>
            <p className="section-subtitle">Assista ao vídeo e veja o impacto das missões</p>
            
            <div className="video-wrapper">
              <iframe
                width="100%"
                height="500"
                src={data.hero.videoUrl}
                title="Ministério de Missões"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Missionaries Section */}
      <section className="missionaries-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <MapPin size={32} />
            <h2>Nossos Missionários</h2>
          </div>
          <p className="section-subtitle">Conheça aqueles que estão levando o Evangelho ao campo</p>
          
          <div className="missionaries-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {data.missionaries.map((missionary, index) => (
              <div key={index} className="missionary-card" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.3s ease'
              }}>
                <img 
                  src={missionary.photo} 
                  alt={missionary.name} 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary-color)',
                    marginBottom: '1.5rem'
                  }}
                />
                <h3 style={{ marginBottom: '0.5rem' }}>{missionary.name}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  color: 'var(--primary-color)',
                  marginBottom: '1rem'
                }}>
                  <MapPin size={16} />
                  <span>{missionary.country}</span>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                  {missionary.description}
                </p>
                <div style={{ 
                  display: 'inline-block',
                  background: 'rgba(212, 175, 55, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  color: 'var(--primary-color)'
                }}>
                  {missionary.yearsOnField} anos no campo
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section" style={{ background: 'var(--bg-color)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <Target size={32} />
            <h2>Nossos Projetos</h2>
          </div>
          <p className="section-subtitle">Ações práticas que transformam vidas</p>
          
          <div className="projects-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {data.projects.map((project, index) => (
              <div key={index} className="project-card" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                transition: 'all 0.3s ease'
              }}>
                <project.icon size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '1rem' }}>{project.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem' }}>
                  {project.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '8px'
                }}>
                  <TrendingUp size={18} color="var(--primary-color)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {project.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Conheça os líderes do ministério de missões</p>
          
          <div className="team-grid">
            {data.team.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.photo} alt={member.name} className="team-photo" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="registration-section">
        <div className="container">
          <div className="section-header">
            <DollarSign size={32} />
            <h2>Contribua com Missões</h2>
          </div>
          <p className="section-subtitle">Sua oferta sustenta missionários e transforma vidas</p>
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={donation.name}
                  onChange={(e) => setDonation({...donation, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={donation.email}
                  onChange={(e) => setDonation({...donation, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={donation.phone}
                  onChange={(e) => setDonation({...donation, phone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={donation.amount}
                  onChange={(e) => setDonation({...donation, amount: e.target.value})}
                  placeholder="100.00"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequência</label>
                <select
                  value={donation.frequency}
                  onChange={(e) => setDonation({...donation, frequency: e.target.value})}
                >
                  <option value="once">Única</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>

              <div className="form-group">
                <label>Destino da Oferta</label>
                <select
                  value={donation.missionary}
                  onChange={(e) => setDonation({...donation, missionary: e.target.value})}
                >
                  <option value="geral">Missões Geral</option>
                  <option value="oliveira">Família Oliveira (Moçambique)</option>
                  <option value="mendes">Casal Mendes (Índia)</option>
                  <option value="andre">Pastor André (Peru)</option>
                  <option value="social">Ação Social</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <Send size={20} />
              Enviar Intenção de Doação
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Missoes;
