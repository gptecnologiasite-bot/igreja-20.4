import React, { useState } from 'react';
import { transformImageLink } from '../utils/imageUtils';
import { Globe, Users, Heart, MapPin, Send, Calendar, DollarSign, Play, Target, TrendingUp, Award, Droplets, Book, Clock, Image as ImageIcon, Star, MessageSquare } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Missoes.css';

const IconMap = {
  Globe, Users, Heart, MapPin, Send, Calendar, DollarSign, Play, Target, TrendingUp, Award, Droplets, Book, Clock, ImageIcon
};

// Missoes.jsx - Página de Missões (Corrigido e Padronizado)
const Missoes = () => {
  const [donation, setDonation] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    frequency: 'once',
    missionary: 'geral'
  });

  const [data] = useMinistryData('missoes');

  // Destructuring with defaults for safety
  const {
    hero = { title: '', subtitle: '', verse: '', image: '', videoUrl: '' },
    mission = { title: '', text: '' },
    stats = [],
    missionaries = [],
    projects = [],
    team = [],
    schedule = [],
    gallery = []
  } = data || {};

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
    <div className="missoes-page">
      {/* Hero Section */}
      <div className="missoes-hero" style={{
        backgroundImage: `url(${transformImageLink(hero.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80')})`,
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Globe size={80} color="var(--primary-color)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))' }} />
          <h1>{hero.title || 'Ministério de Missões'}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          {hero.verse && (
            <div className="hero-verse">
              <p>{hero.verse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <h2>{mission.title || 'Nossa Missão'}</h2>
          </div>
          <p className="mission-text">
            {mission.text}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => {
                const Icon = IconMap[stat.icon] || Globe;
                return (
                  <div key={index} className="stat-card">
                    <Icon size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                    <div className="stat-number" style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      {stat.number}
                    </div>
                    <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {(() => {
        let finalUrl = hero.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        if (finalUrl && !finalUrl.includes('/embed/')) {
          const wMatch = finalUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          const yMatch = finalUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
          const lMatch = finalUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
          const vidId = (wMatch || yMatch || lMatch || [])[1];
          if (vidId) finalUrl = `https://www.youtube.com/embed/${vidId}`;
        }
        
        return finalUrl ? (
          <section className="video-section" style={{ padding: '6rem 0', background: '#0f111a' }}>
            <div className="container">
              <div className="section-header">
                <Play size={32} color="var(--primary-color)" />
                <h2>Conheça o Trabalho</h2>
              </div>
              <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Assista ao vídeo e veja como Deus tem operado através deste ministério
              </p>

              <div className="video-wrapper" style={{ 
                position: 'relative', 
                paddingBottom: '56.25%', 
                height: 0, 
                overflow: 'hidden', 
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={finalUrl}
                  title="Ministério de Missões"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* Missionaries Section */}
      {missionaries && missionaries.length > 0 && (
        <section className="missionaries-section">
          <div className="container">
            <div className="section-header">
              <MapPin size={32} color="var(--primary-color)" />
              <h2>Nossos Missionários</h2>
            </div>
            <p className="section-subtitle">Conheça aqueles que estão no campo levando a semente</p>

            <div className="missionaries-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              marginTop: '1rem'
            }}>
              {missionaries.map((missionary, index) => (
                <div key={index} className="missionary-card">
                  <img
                    src={transformImageLink(missionary.photo || missionary.image)}
                    alt={missionary.name}
                  />
                  <h3>{missionary.name}</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--primary-color)',
                    marginBottom: '1.2rem',
                    fontWeight: '600'
                  }}>
                    <MapPin size={18} />
                    <span>{missionary.country || missionary.location}</span>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
                    {missionary.description}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(212, 175, 55, 0.1)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    color: 'var(--primary-color)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    {missionary.yearsOnField || missionary.since} anos no campo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="projects-section">
          <div className="container">
            <div className="section-header">
              <Target size={32} color="var(--primary-color)" />
              <h2>Projetos em Andamento</h2>
            </div>
            <p className="section-subtitle">Ações estratégicas para a expansão do Reino</p>

            <div className="projects-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              marginTop: '1rem'
            }}>
              {projects.map((project, index) => {
                const Icon = IconMap[project.icon] || Target;
                return (
                  <div key={index} className="project-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      <div style={{ 
                        background: 'rgba(212, 175, 55, 0.1)', 
                        padding: '1rem', 
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={32} color="var(--primary-color)" />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{project.title}</h3>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                      {project.description}
                    </p>
                    <div style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <TrendingUp size={20} color="var(--primary-color)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                        Impacto: {project.impact || project.goal || 'Contínuo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      {schedule && schedule.length > 0 && (
        <section className="schedule-section" style={{ padding: '6rem 0', background: '#161a29' }}>
          <div className="container">
            <div className="section-header">
              <Calendar size={32} color="var(--primary-color)" />
              <h2>Programação Geral</h2>
            </div>
            <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Fique por dentro das nossas atividades e reuniões
            </p>
            
            <div className="schedule-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginTop: '1rem'
            }}>
              {schedule.map((item, index) => (
                <div key={index} className="schedule-card" style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.2rem', fontSize: '1.3rem' }}>{item.activity || item.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                      <Calendar size={18} color="var(--primary-color)" />
                      <span>{item.day || item.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                      <Clock size={18} color="var(--primary-color)" />
                      <span>{item.time}</span>
                    </div>
                    {item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                        <MapPin size={18} color="var(--primary-color)" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <p style={{ marginTop: '1.2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery && gallery.length > 0 && (
        <section className="gallery-section" style={{ padding: '6rem 0', background: '#0f111a' }}>
          <div className="container">
            <div className="section-header">
              <ImageIcon size={32} color="var(--primary-color)" />
              <h2>Galeria de Missões</h2>
            </div>
            <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Registros de momentos preciosos no campo missionário
            </p>
            
            <div className="gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}>
              {gallery.map((img, index) => (
                <div key={index} className="gallery-item" style={{
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative'
                }}>
                  <img 
                    src={transformImageLink(img.url)} 
                    alt={img.description || 'Galeria Missões'} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                  {img.description && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '1.5rem 1rem 1rem',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}>
                      {img.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {team && team.length > 0 && (
        <section className="team-section" style={{ padding: '6rem 0', background: '#0f111a' }}>
          <div className="container">
            <div className="section-header">
              <Users size={32} color="var(--primary-color)" />
              <h2>Liderança do Ministério</h2>
            </div>
            <p className="section-subtitle">Aqueles que coordenam e apoiam a visão missionária</p>

            <div className="team-grid" style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
               gap: '3rem',
               justifyContent: 'center',
               maxWidth: '900px',
               margin: '0 auto'
            }}>
              {team.map((member, index) => (
                <div key={index} className="team-card" style={{ textAlign: 'center' }}>
                  <img 
                    src={transformImageLink(member.photo)} 
                    alt={member.name} 
                    style={{ 
                      width: '180px', 
                      height: '180px', 
                      borderRadius: '24px', 
                      objectFit: 'cover', 
                      marginBottom: '1.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }} 
                  />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{member.name}</h3>
                  <p style={{ color: 'var(--primary-color)', fontWeight: '500' }}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Donation Form */}
      <section className="registration-section">
        <div className="container">
          <div className="section-header">
            <DollarSign size={32} color="var(--primary-color)" />
            <h2>Contribua com a Missão</h2>
          </div>
          <p className="section-subtitle">Sua contribuição sustenta e impulsiona o Reino</p>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={donation.name}
                  onChange={(e) => setDonation({ ...donation, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={donation.email}
                  onChange={(e) => setDonation({ ...donation, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={donation.phone}
                  onChange={(e) => setDonation({ ...donation, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label>Valor da Oferta (R$) *</label>
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  value={donation.amount}
                  onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Frequência</label>
                <select
                  value={donation.frequency}
                  onChange={(e) => setDonation({ ...donation, frequency: e.target.value })}
                >
                  <option value="once">Oferta Única</option>
                  <option value="monthly">Mensal (Sócio Missionário)</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>

              <div className="form-group">
                <label>Destino da Contribuição</label>
                <select
                  value={donation.missionary}
                  onChange={(e) => setDonation({ ...donation, missionary: e.target.value })}
                >
                  <option value="geral">Missões Geral</option>
                  {missionaries && missionaries.map((m, idx) => (
                    <option key={idx} value={m.name.toLowerCase().replace(/\s+/g, '-')}>
                      {m.name} ({m.country || m.location})
                    </option>
                  ))}
                  <option value="social">Ação Social</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
              <Send size={20} />
              Enviar Intenção de Contribuição
            </button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              * Após o envio, nossa equipe entrará em contato para fornecer os dados bancários ou PIX seguro.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Missoes;
