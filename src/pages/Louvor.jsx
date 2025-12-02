import { Music, Calendar, Clock, Users, MessageSquare, Send, Mic, Guitar, Headphones, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Louvor.css';
import DatabaseService from '../services/DatabaseService';

const Louvor = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [data, setData] = useState(DatabaseService.getMinistryDefault('louvor'));

  useEffect(() => {
    DatabaseService.getMinistry('louvor').then(setData);

    const handleStorageChange = () => {
      DatabaseService.getMinistry('louvor').then(setData);
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
    <div className="louvor-page">
      {/* Hero Section */}
      <div className="louvor-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Music size={80} className="hero-icon" />
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

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programação Semanal</h2>
          </div>
          <p className="section-subtitle">Confira os horários de ensaios e apresentações</p>
          
          <div className="schedule-grid">
            {data.schedule.map((item, index) => {
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
