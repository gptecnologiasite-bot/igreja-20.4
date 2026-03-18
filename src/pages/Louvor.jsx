import React, { useState } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { Music, Calendar, Clock, Users, MessageSquare, Send, Mic, Guitar, Headphones, Heart, Camera, Gift } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Louvor.css';

const Louvor = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [data] = useMinistryData('louvor');

  const {
    hero = {
      title: 'Ministério de Louvor',
      subtitle: 'Adorando a Deus em espírito e em verdade',
      verse: '"Cantai ao Senhor um cântico novo..." - Salmos 96:1',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop'
    },
    mission = {
      title: 'Nossa Missão',
      text: 'Conduzir a igreja à presença de Deus através da música, com excelência e unção.'
    },
    schedule = [],
    team = [],
    gallery = [],
    birthdays = {
      title: 'Aniversariantes do Mês',
      text: 'Parabéns aos nossos adoradores aniversariantes!',
      people: []
    }
  } = data || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Testemunho enviado com sucesso! Obrigado por compartilhar.');
    setTestimonial({ name: '', email: '', message: '' });
  };

  return (
    <div className="louvor-page">
      {/* Hero Section */}
      <div className="louvor-hero" style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${transformImageLink(hero.image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="hero-content">
          <Music size={80} className="hero-icon" />
          <h1>{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-verse">
            <p>{hero.verse}</p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{mission.title}</h2>
          <p className="mission-text">
            {mission.text}
          </p>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programação Semanal</h2>
          </div>
          <p className="section-subtitle">Confira os horários de ensaios e apresentações</p>

          <div className="schedule-grid">
            {schedule.map((item, index) => {
              // Default icon logic based on activity name
              const IconComponent = item.activity.includes('Vocais') ? Mic :
                item.activity.includes('Instrumentos') ? Guitar :
                  item.activity.includes('Som') ? Headphones : Music;
              return (
                <div key={index} className="schedule-card">
                  <div className="schedule-icon">
                    <IconComponent size={32} />
                  </div>
                  <div className="schedule-content">
                    <div className="schedule-header">
                      <h3>{item.activity || item.title}</h3>
                      <span className="day-badge">{item.day || item.date}</span>
                    </div>
                    <p className="schedule-description">{item.description}</p>
                    <div className="schedule-details">
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{item.time}</span>
                      </div>
                      <div className="detail-item">
                        <Users size={16} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
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
          <p className="section-subtitle">Conheça os líderes do ministério de louvor</p>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <img src={transformImageLink(member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`)} alt={member.name} className="team-photo" />
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
          <p className="section-subtitle">Momentos especiais do nosso ministério</p>

          <div className="gallery-grid">
            {gallery.length > 0 ? (
              gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={transformImageLink(photo.url)} alt={photo.caption || photo.title} />
                  <div className="gallery-overlay">
                    <span>{photo.caption || photo.title}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-gallery">
                <p>Nenhuma foto na galeria no momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Birthdays Section */}
      <section className="birthdays-section">
        <div className="container">
          <div className="section-header">
            <Gift size={32} />
            <h2>{birthdays.title || 'Aniversariantes do Mês'}</h2>
          </div>
          <p className="section-subtitle">{birthdays.text || 'Parabéns aos nossos adoradores aniversariantes!'}</p>

          <div className="birthdays-grid">
            {(birthdays.people || []).map((person, index) => (
              <div key={index} className="birthday-card">
                <div className="birthday-photo-wrap">
                  <img 
                    src={transformImageLink(person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=9b59b6&color=fff`)} 
                    alt={person.name} 
                  />
                  <div className="birthday-badge">🎂</div>
                </div>
                <h3>{person.name}</h3>
                <span className="birthday-date">{person.date}</span>
              </div>
            ))}
            {(!birthdays.people || birthdays.people.length === 0) && (
              <div className="empty-birthdays">
                <p>Nenhum aniversariante este mês.</p>
              </div>
            )}
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
          <p className="section-subtitle">Como o louvor tem impactado sua vida? Conte para nós!</p>

          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="testimonial-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  value={testimonial.name}
                  onChange={(e) => setTestimonial({ ...testimonial, name: e.target.value })}
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
                  onChange={(e) => setTestimonial({ ...testimonial, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Seu Testemunho</label>
                <textarea
                  id="message"
                  value={testimonial.message}
                  onChange={(e) => setTestimonial({ ...testimonial, message: e.target.value })}
                  placeholder="Compartilhe como o louvor tem tocado seu coração..."
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
      <section className="louvor-cta">
        <div className="container">
          <Music size={48} className="cta-icon" />
          <h2>Faça Parte do Ministério</h2>
          <p>Tem talento musical ou deseja servir a Deus através do louvor? Venha fazer parte da nossa equipe!</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Participar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Louvor;
