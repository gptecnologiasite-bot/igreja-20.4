import { Heart, Calendar, Users, Camera, MessageSquare, MapPin, Clock, Send, Package, Utensils, Shirt } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Social.css';
import DatabaseService from '../services/DatabaseService';

const Social = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [data, setData] = useState(DatabaseService.getMinistryDefault('social'));

  useEffect(() => {
    DatabaseService.getMinistry('social').then(setData);

    const handleStorageChange = () => {
      DatabaseService.getMinistry('social').then(setData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Testemunho enviado com sucesso! Obrigado por compartilhar.');
    setTestimonial({ name: '', email: '', message: '' });
  };

  return (
    <div className="social-page">
      {/* Hero Section */}
      <div className="social-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Heart size={64} className="hero-icon" />
          <h1>{data.hero.title}</h1>
          <p className="hero-subtitle">{data.hero.subtitle}</p>
          <div className="hero-stats">
            <div className="stat-card">
              <Users size={32} />
              <strong>500+</strong>
              <span>Famílias Atendidas</span>
            </div>
            <div className="stat-card">
              <Package size={32} />
              <strong>1000+</strong>
              <span>Cestas Distribuídas</span>
            </div>
            <div className="stat-card">
              <Heart size={32} />
              <strong>50+</strong>
              <span>Voluntários Ativos</span>
            </div>
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

      {/* Events Section */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Nossos Projetos</h2>
          </div>
          <p className="section-subtitle">Conheça as ações que realizamos regularmente</p>
          
          <div className="events-grid">
            {data.schedule.map((event, index) => {
              // Default icon logic
              const IconComponent = event.title.includes('Cestas') ? Package :
                                    event.title.includes('Sopa') ? Utensils :
                                    event.title.includes('Bazar') ? Shirt : Heart;
              return (
                <div key={index} className="event-card">
                  <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                    <div className="event-icon-badge">
                      <IconComponent size={32} />
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
                      <div className="event-detail">
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                      <div className="event-detail">
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className="event-detail">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="volunteer-btn">
                      <Heart size={18} /> Quero Ser Voluntário
                    </button>
                  </div>
                </div>
              );
            })}
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
          <p className="section-subtitle">Momentos especiais das nossas ações</p>
          
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

      {/* Testimonials Form Section */}
      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Compartilhe Seu Testemunho</h2>
          </div>
          <p className="section-subtitle">Você foi impactado pela nossa ação social? Conte sua história!</p>
          
          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="testimonial-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  value={testimonial.name}
                  onChange={(e) => setTestimonial({...testimonial, name: e.target.value})}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Opcional)</label>
                <input
                  type="email"
                  id="email"
                  value={testimonial.email}
                  onChange={(e) => setTestimonial({...testimonial, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Seu Testemunho</label>
                <textarea
                  id="message"
                  value={testimonial.message}
                  onChange={(e) => setTestimonial({...testimonial, message: e.target.value})}
                  placeholder="Compartilhe como a ação social impactou sua vida..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <Send size={18} /> Enviar Testemunho
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="social-cta">
        <div className="container">
          <h2>Faça Parte Dessa Transformação</h2>
          <p>Seja um voluntário ou faça uma doação. Juntos podemos fazer a diferença!</p>
          <div className="cta-buttons">
            <button className="cta-button primary">
              <Heart size={18} /> Ser Voluntário
            </button>
            <button className="cta-button secondary">
              <Package size={18} /> Fazer Doação
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Social;
