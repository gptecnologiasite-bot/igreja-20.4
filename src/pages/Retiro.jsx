import { Mountain, Calendar, MapPin, Users, Camera, Send, Heart, Clock, Tent, Coffee, Book, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Retiro.css';
import DatabaseService from '../services/DatabaseService';

const Retiro = () => {
  const [registration, setRegistration] = useState({
    name: '',
    phone: '',
    email: '',
    retreat: ''
  });

  const [data, setData] = useState(DatabaseService.getMinistryDefault('retiro'));

  useEffect(() => {
    DatabaseService.getMinistry('retiro').then(setData);

    const handleStorageChange = () => {
      DatabaseService.getMinistry('retiro').then(setData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
          <p className="mission-text">{data.mission.text}</p>
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
            {data.schedule.map((retreat, index) => {
              // Default icon logic
              const IconComponent = retreat.title.includes('Jovens') ? Music :
                                    retreat.title.includes('Casais') ? Heart :
                                    retreat.title.includes('Obreiros') ? Book : Mountain;
              return (
                <div key={index} className="retreat-card">
                  <div className="retreat-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3>{retreat.title}</h3>
                  <p className="retreat-description">{retreat.description}</p>
                  
                  <div className="retreat-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{retreat.date}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{retreat.location}</span>
                    </div>
                  </div>
                  
                  <button className="register-btn">
                    <Send size={16} /> Inscrever-se
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Coordenadores dedicados a servir</p>
          
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

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <Camera size={32} />
            <h2>Galeria de Fotos</h2>
          </div>
          <p className="section-subtitle">Momentos especiais dos nossos retiros</p>
          
          <div className="gallery-grid">
            {data.gallery.map((photo, index) => (
              <div key={index} className="gallery-item">
                <img src={photo.url} alt={photo.caption} />
                <div className="gallery-overlay">
                  <span>{photo.caption}</span>
                </div>
              </div>
            ))}
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
                  onChange={(e) => setRegistration({...registration, name: e.target.value})}
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
                    onChange={(e) => setRegistration({...registration, phone: e.target.value})}
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
                    onChange={(e) => setRegistration({...registration, email: e.target.value})}
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
                  onChange={(e) => setRegistration({...registration, retreat: e.target.value})}
                  required
                >
                  <option value="">Selecione um retiro</option>
                  {data.schedule.map((item, index) => (
                    <option key={index} value={item.title}>{item.title}</option>
                  ))}
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
