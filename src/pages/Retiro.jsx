import React, { useState } from 'react';
import { Mountain, Calendar, MapPin, Users, Camera, Send, Heart, Clock, Tent, Book, Music } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';

const Retiro = () => {
  const [registration, setRegistration] = useState({
    name: '',
    phone: '',
    email: '',
    retreat: ''
  });

  const [data] = useMinistryData('retiro');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Inscrição realizada com sucesso! Entraremos em contato em breve.');
    setRegistration({ name: '', phone: '', email: '', retreat: '' });
  };

  return (
    <div className="retiro-page">
      {/* Hero Section */}
      <div className="retiro-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Mountain size={80} className="hero-icon" />
          <h1>{data.hero?.title || 'Retiros Espirituais'}</h1>
          <p className="hero-subtitle">{data.hero?.subtitle || ''}</p>
          {data.hero?.verse && (
            <div className="hero-verse">
              <p>{data.hero.verse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{data.mission?.title || 'Por Que Participar?'}</h2>
          <p className="mission-text">{data.mission?.text || ''}</p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <Tent size={40} />
              <h3>Descanso Espiritual</h3>
              <p>Afaste-se da rotina e renove suas forças em Deus</p>
            </div>
            <div className="benefit-card">
              <Users size={40} />
              <h3>Comunhão</h3>
              <p>Fortaleça laços com irmãos em Cristo</p>
            </div>
            <div className="benefit-card">
              <Book size={40} />
              <h3>Ensino</h3>
              <p>Aprofunde-se na Palavra de Deus</p>
            </div>
            <div className="benefit-card">
              <Music size={40} />
              <h3>Adoração</h3>
              <p>Momentos intensos de louvor e adoração</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Retreats Section */}
      <section className="retreats-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Próximos Retiros</h2>
          </div>
          <p className="section-subtitle">Escolha o retiro ideal para você</p>

          <div className="retreats-grid">
            {data.schedule && data.schedule.length > 0 ? (
              data.schedule.map((retreat, index) => {
                const retreatTitle = retreat.title || retreat.activity || 'Retiro';
                // Default icon logic
                const IconComponent = retreatTitle.includes('Jovens') ? Music :
                  retreatTitle.includes('Casais') ? Heart :
                    retreatTitle.includes('Obreiros') ? Book : Mountain;
                return (
                  <div key={index} className="retreat-card">
                    <div className="retreat-icon">
                      <IconComponent size={32} />
                    </div>
                    <h3>{retreatTitle}</h3>
                    <p className="retreat-description">{retreat.description || ''}</p>

                    <div className="retreat-details">
                      {(retreat.date || retreat.day) && (
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span>{retreat.date || retreat.day}</span>
                        </div>
                      )}
                      {retreat.location && (
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{retreat.location}</span>
                        </div>
                      )}
                    </div>

                    <button className="register-btn">
                      <Send size={16} /> Inscrever-se
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Nenhum retiro programado no momento. Em breve teremos novidades!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Coordenadores dedicados a servir</p>

          <div className="team-grid">
            {data.team && data.team.length > 0 ? (
              data.team.map((member, index) => (
                <div key={index} className="team-card">
                  <img src={member.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name || 'Membro')} alt={member.name || 'Membro'} className="team-photo" />
                  <h3>{member.name || 'Membro'}</h3>
                  <p>{member.role || ''}</p>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Informações da equipe em breve.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <Camera size={32} />
            <h2>Galeria de Fotos</h2>
          </div>
          <p className="section-subtitle">Momentos especiais dos nossos retiros</p>

          <div className="gallery-grid">
            {data.gallery && data.gallery.length > 0 ? (
              data.gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={photo.url} alt={photo.caption || 'Foto do retiro'} />
                  <div className="gallery-overlay">
                    <span>{photo.caption || 'Momentos especiais'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Galeria de fotos em breve.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="registration-form-section">
        <div className="container">
          <div className="section-header">
            <Send size={32} />
            <h2>Faça Sua Inscrição</h2>
          </div>
          <p className="section-subtitle">Preencha o formulário e garanta sua vaga</p>

          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  value={registration.name}
                  onChange={(e) => setRegistration({ ...registration, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={registration.phone}
                    onChange={(e) => setRegistration({ ...registration, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={registration.email}
                    onChange={(e) => setRegistration({ ...registration, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="retreat">Escolha o Retiro</label>
                <select
                  id="retreat"
                  value={registration.retreat}
                  onChange={(e) => setRegistration({ ...registration, retreat: e.target.value })}
                  required
                >
                  <option value="">Selecione um retiro</option>
                  {data.schedule && data.schedule.length > 0 ? (
                    data.schedule.map((item, index) => {
                      const retreatName = item.title || item.activity || `Retiro ${index + 1} `;
                      return (
                        <option key={index} value={retreatName}>{retreatName}</option>
                      );
                    })
                  ) : (
                    <option value="geral">Retiro Geral</option>
                  )}
                </select>
              </div>

              <button type="submit" className="submit-btn">
                <Send size={18} /> Enviar Inscrição
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="retiro-cta">
        <div className="container">
          <Mountain size={48} className="cta-icon" />
          <h2>Não Perca Esta Oportunidade!</h2>
          <p>Separe um tempo para estar na presença de Deus e renovar suas forças</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Participar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Retiro;
