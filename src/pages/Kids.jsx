import React from 'react';
import { Calendar, Clock, MapPin, Heart, Star, Camera, Users, BookOpen } from 'lucide-react';
import '../css/Kids.css';
import { useMinistryData } from '../hooks/useMinistryData';

const Kids = () => {
  const [data] = useMinistryData('kids');

  return (
    <div className="kids-page">
      {/* Hero Section */}
      <div className="kids-hero">
        <div className="hero-content">
          <h1>{data.hero.title}</h1>
          <p className="hero-subtitle">{data.hero.subtitle}</p>
          <div className="hero-stats">
            <div className="stat-item">
              <Users size={32} />
              <div>
                <strong>150+</strong>
                <span>Crianças</span>
              </div>
            </div>
            <div className="stat-item">
              <BookOpen size={32} />
              <div>
                <strong>20+</strong>
                <span>Professores</span>
              </div>
            </div>
            <div className="stat-item">
              <Heart size={32} />
              <div>
                <strong>100%</strong>
                <span>Amor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="kids-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <Clock className="info-icon" />
              <h3>Horários</h3>
              {data.info.schedule.map((time, index) => (
                <p key={index}>{time}</p>
              ))}
            </div>
            <div className="info-card">
              <MapPin className="info-icon" />
              <h3>Local</h3>
              <p>{data.info.location}</p>
            </div>
            <div className="info-card">
              <Users className="info-icon" />
              <h3>Idade</h3>
              <p>{data.info.age}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <section className="events-section">
        <div className="container">
          <h2>Próximos Eventos</h2>
          <p className="section-subtitle">Não perca as atividades especiais do Kids!</p>

          <div className="events-grid">
            {data.schedule.map((event, index) => (
              <div key={index} className="event-card">
                <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                  <div className="event-badge">
                    <Calendar size={16} />
                    {event.date}
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="event-btn">Quero Participar</button>
                </div>
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
          <p className="section-subtitle">Momentos especiais do nosso ministério</p>

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

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>O Que as Crianças Dizem</h2>
          <p className="section-subtitle">Depoimentos dos nossos pequenos</p>

          <div className="testimonials-grid">
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--primary-color)" color="var(--primary-color)" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.photo} alt={testimonial.name} />
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.age} anos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="kids-cta">
        <div className="container">
          <h2>Traga Seu Filho!</h2>
          <p>Venha conhecer o Ministério Kids. Um lugar seguro, divertido e cheio do amor de Deus.</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Conhecer
          </button>
        </div>
      </section>
    </div>
  );
};

export default Kids;
