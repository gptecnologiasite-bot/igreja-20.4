import { Heart, Users, Calendar, MessageSquare, Send, Clock, Star, Play, BookOpen, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Lares.css';
import DatabaseService from '../services/DatabaseService';

const Intercessão = () => {
  const [prayerRequest, setPrayerRequest] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
    isUrgent: false,
    isConfidential: true
  });

  const [data, setData] = useState(DatabaseService.getMinistryDefault('intercessao'));

  useEffect(() => {
    DatabaseService.getMinistry('intercessao').then(ministryData => {
      if (ministryData) setData(ministryData);
    });

    const handleStorageChange = () => {
      DatabaseService.getMinistry('intercessao').then(ministryData => {
        if (ministryData) setData(ministryData);
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Pedido de oração enviado com sucesso! Estaremos orando por você.');
    setPrayerRequest({ 
      name: '', 
      email: '', 
      phone: '', 
      request: '', 
      isUrgent: false, 
      isConfidential: true 
    });
  };

  return (
    <div className="lares-page">
      {/* Hero Section */}
      <div className="lares-hero" style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80)',
        backgroundBlendMode: 'overlay'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Heart size={80} className="hero-icon" />
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


      {/* Spotify Podcast Section */}
      <section className="video-section">
        <div className="container">
          <div className="section-header">
            <Play size={32} />
            <h2>Ouça Nosso Podcast</h2>
          </div>
          <p className="section-subtitle">Mensagens de oração e intercessão</p>
          
          <div className="video-wrapper">
            <iframe 
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/show/2lzm9pXbj4PCoWcxsFzDtf?utm_source=generator" 
              width="100%" 
              height="352" 
              frameBorder="0" 
              allowFullScreen="" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>


      {/* Schedule Section */}
      <section className="schedule-section" style={{ background: 'var(--bg-color)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Agenda de Oração</h2>
          </div>
          <p className="section-subtitle">Participe dos nossos encontros de intercessão</p>
          
          <div className="schedule-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {data.schedule.map((item, index) => (
              <div key={index} className="schedule-card" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Clock size={24} color="var(--primary-color)" />
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{item.day}</h3>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{item.time}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Conheça os líderes do ministério de intercessão</p>
          
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

      {/* Testimonials Section */}
      <section className="testimonials-section" style={{ background: 'var(--nav-bg)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <Star size={32} />
            <h2>Testemunhos</h2>
          </div>
          <p className="section-subtitle">Veja o que Deus tem feito através da oração</p>
          
          <div className="testimonials-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                position: 'relative'
              }}>
                <MessageSquare size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                  "{testimonial.text}"
                </p>
                <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  - {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prayer Request Form */}
      <section className="registration-section">
        <div className="container">
          <div className="section-header">
            <Send size={32} />
            <h2>Envie seu Pedido de Oração</h2>
          </div>
          <p className="section-subtitle">Compartilhe sua necessidade e conte com nossa intercessão</p>
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={prayerRequest.name}
                  onChange={(e) => setPrayerRequest({...prayerRequest, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={prayerRequest.email}
                  onChange={(e) => setPrayerRequest({...prayerRequest, email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={prayerRequest.phone}
                onChange={(e) => setPrayerRequest({...prayerRequest, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Pedido de Oração *</label>
              <textarea
                rows="6"
                value={prayerRequest.request}
                onChange={(e) => setPrayerRequest({...prayerRequest, request: e.target.value})}
                placeholder="Compartilhe sua necessidade de oração..."
                required
              ></textarea>
            </div>

            <div className="form-row" style={{ gap: '2rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prayerRequest.isUrgent}
                    onChange={(e) => setPrayerRequest({...prayerRequest, isUrgent: e.target.checked})}
                  />
                  <Shield size={18} color="var(--primary-color)" />
                  Pedido Urgente
                </label>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={prayerRequest.isConfidential}
                    onChange={(e) => setPrayerRequest({...prayerRequest, isConfidential: e.target.checked})}
                  />
                  <BookOpen size={18} color="var(--primary-color)" />
                  Manter Confidencial
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <Send size={20} />
              Enviar Pedido de Oração
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Intercessão;
