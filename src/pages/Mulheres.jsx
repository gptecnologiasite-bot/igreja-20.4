import React, { useState } from 'react';
import { Heart, Calendar, Clock, Users, Camera, MessageSquare, Send, Star, BookOpen, Sparkles, Crown } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';

const Mulheres = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [data] = useMinistryData('mulheres');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Testemunho enviado com sucesso! Obrigado por compartilhar.');
    setTestimonial({ name: '', email: '', message: '' });
  };

  return (
    <div className="mulheres-page">
      {/* Hero Section */}
      <div className="mulheres-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Crown size={80} className="hero-icon" />
          <h1>{data.hero.title}</h1>
          <p className="hero-subtitle">{data.hero.subtitle}</p>
          <div className="hero-verse">
            <p>{data.hero.verse}</p>
          </div>
        </div>
      </div>

      {/* Gospel Message Section */}
      <section className="gospel-section">
        <div className="container">
          <div className="gospel-content">
            <h2>Jesus Te Ama!</h2>
            <p className="gospel-text">
              Querida mulher, você é preciosa aos olhos de Deus! Não importa o que você tenha passado,
              Jesus Cristo morreu na cruz por você e ressuscitou para te dar vida nova. Ele quer curar
              suas feridas, restaurar seus sonhos e te dar um propósito eterno.
            </p>
            <div className="gospel-steps">
              <div className="gospel-step">
                <div className="step-number">1</div>
                <h3>Reconheça</h3>
                <p>Todos pecamos e precisamos do perdão de Deus (Romanos 3:23)</p>
              </div>
              <div className="gospel-step">
                <div className="step-number">2</div>
                <h3>Creia</h3>
                <p>Jesus morreu por você e ressuscitou (João 3:16)</p>
              </div>
              <div className="gospel-step">
                <div className="step-number">3</div>
                <h3>Aceite</h3>
                <p>Receba Jesus como seu Salvador e Senhor (João 1:12)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{data.mission.title}</h2>
          <p className="mission-text">
            {data.mission.text}
          </p>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programação</h2>
          </div>
          <p className="section-subtitle">Participe das nossas atividades</p>

          <div className="schedule-grid">
            {data.schedule.map((item, index) => {
              // Default icon logic
              const IconComponent = item.activity.includes('EBD') ? BookOpen :
                item.activity.includes('Célula') ? Users :
                  item.activity.includes('Café') ? Sparkles : Heart;
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
          <p className="section-subtitle">Mulheres que servem a Deus com excelência</p>

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
          <p className="section-subtitle">Momentos especiais do ministério</p>

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

      {/* Testimonials Display */}
      <section className="testimonials-display-section">
        <div className="container">
          <h2>Testemunhos de Transformação</h2>
          <p className="section-subtitle">Veja como Jesus tem mudado vidas</p>

          <div className="testimonials-grid">
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#e91e63" color="#e91e63" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.photo} alt={testimonial.name} />
                  <strong>{testimonial.name}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Form Section */}
      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Compartilhe Seu Testemunho</h2>
          </div>
          <p className="section-subtitle">Como Jesus tem trabalhado em sua vida?</p>

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
                  placeholder="Compartilhe como Jesus transformou sua vida..."
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
      <section className="mulheres-cta">
        <div className="container">
          <Crown size={48} className="cta-icon" />
          <h2>Você é Especial para Deus!</h2>
          <p>Venha fazer parte de uma comunidade de mulheres que amam a Jesus</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Conhecer Jesus
          </button>
        </div>
      </section>
    </div>
  );
};

export default Mulheres;
