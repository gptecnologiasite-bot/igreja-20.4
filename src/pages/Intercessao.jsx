import React from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { Heart, Calendar, MessageSquare, Clock, Play } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Lares.css';

const Intercessao = () => {
  const [data] = useMinistryData('intercessao');

  return (
    <div className="lares-page">
      {/* Hero Section */}
      <div className="lares-hero" style={{
        backgroundImage: `url(${data?.hero?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80'})`,
        backgroundBlendMode: 'overlay'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {data?.whatsappUrl ? (
            <MessageSquare size={80} className="hero-icon" color="#25D366" style={{ filter: 'drop-shadow(0 0 20px rgba(37, 211, 102, 0.4))' }} />
          ) : (
            <Heart size={80} className="hero-icon" />
          )}
          <h1>{data?.hero?.title || 'Ministério de Intercessão'}</h1>
          <p className="hero-subtitle">{data?.hero?.subtitle || 'Clamando ao Senhor em todo o tempo'}</p>
          <div className="hero-verse">
            <p>{data?.hero?.verse || '"Orai sem cessar." - 1 Tessalonicenses 5:17'}</p>
          </div>
          {data?.whatsappUrl && (
            <a 
              href={data.whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="submit-btn" 
              style={{ marginTop: '2rem', background: '#25D366', maxWidth: '300px', margin: '2rem auto 0' }}
            >
              <MessageSquare size={20} />
              Entrar no Grupo de Oração
            </a>
          )}
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{data?.mission?.title || 'Nossa Missão'}</h2>
          <p className="mission-text">
            {data?.mission?.text || 'Sustentar a igreja, seus ministérios e famílias através da oração intercessória.'}
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
            {(data?.schedule || []).map((item, index) => (
              <div key={index} className="schedule-card" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '2.5rem 2rem',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', justifyContent: 'center' }}>
                  <Clock size={24} color="var(--primary-color)" />
                  <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>{item.day}</h3>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#fff' }}>{item.time}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', marginTop: '0.5rem' }}>{item.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section / WhatsApp Invitation */}
      <section className="team-section">
        <div className="container">
          {data?.whatsappUrl ? (
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <div className="section-header">
                <MessageSquare size={40} color="#25D366" />
                <h2>Corrente de Intercessão</h2>
                <p className="section-subtitle">Substituímos a galeria de fotos pelo nosso grupo oficial de oração</p>
              </div>
              
              <div className="team-card" style={{ 
                borderTop: '5px solid #25D366', 
                padding: '4rem 2rem', 
                background: 'rgba(37, 211, 102, 0.03)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  margin: '0 auto 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(37, 211, 102, 0.3)'
                }}>
                  <MessageSquare size={50} color="#fff" />
                </div>
                <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Entre em Nosso Grupo</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2.5rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                  A nossa equipe de intercessores está reunida no WhatsApp. <br/>
                  Clique abaixo para entrar e deixar seus pedidos ou orar conosco em tempo real.
                </p>
                <a 
                  href={data.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="submit-btn" 
                  style={{ 
                    background: '#25D366', 
                    width: 'auto', 
                    padding: '1.2rem 3rem', 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <MessageSquare size={24} />
                  ACESSAR WHATSAPP AGORA
                </a>
              </div>
            </div>
          ) : (
            <>
              <h2>Nossa Equipe</h2>
              <p className="section-subtitle">Conheça os líderes do ministério de intercessão</p>
              <div className="team-grid">
                {(data?.team || []).map((member, idx) => (
                  <div key={idx} className="team-card">
                    <div className="team-photo-wrap">
                      <img src={transformImageLink(member.photo)} alt={member.name} className="team-photo" />
                    </div>
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Intercessao;
