import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { Heart, Calendar, Clock, Users, Camera, Star, BookOpen, Sparkles, Gift, Flame } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Casais.css';

const Casais = () => {
  const [data] = useMinistryData('casais');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.gallery && data.gallery.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % data.gallery.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data.gallery]);

  return (
    <div className="casais-page">
      {/* Hero Section */}
      <div className="casais-hero">
        <div className="hero-slideshow">
          {data.gallery && data.gallery.length > 0 ? (
            data.gallery.map((photo, index) => (
              <div
                key={index}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${transformImageLink(photo.url)})` }}
              ></div>
            ))
          ) : (
            <div
              className="hero-slide active"
              style={{ backgroundImage: `url(${transformImageLink(data.hero.image)})` }}
            ></div>
          )}
        </div>
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

      {/* Gospel Message Section */}
      <section className="gospel-section">
        <div className="container">
          <div className="gospel-content">
            <h2>Amor que Transforma</h2>
            <p className="gospel-text">
              O casamento é um projeto de Deus! Ele criou a família para ser um reflexo do Seu amor por nós. 
              Em um mundo de incertezas, Jesus Cristo oferece a rocha firme para edificar o seu lar. 
              Ele quer restaurar a comunicação, renovar o carinho e fortalecer o compromisso entre vocês.
            </p>
            <div className="gospel-steps">
              <div className="gospel-step">
                <div className="step-number">1</div>
                <h3>Priorize</h3>
                <p>Busquem primeiro o Reino de Deus em seu lar (Mateus 6:33)</p>
              </div>
              <div className="gospel-step">
                <div className="step-number">2</div>
                <h3>Perdoe</h3>
                <p>O perdão é o combustível do amor duradouro (Colossenses 3:13)</p>
              </div>
              <div className="gospel-step">
                <div className="step-number">3</div>
                <h3>Ame</h3>
                <p>Amem-se como Cristo amou a Igreja (Efésios 5:25)</p>
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
          <p className="section-subtitle">Momentos de crescimento e comunhão</p>

          <div className="schedule-grid">
            {data.schedule?.map((item, index) => {
              const activityStr = item.activity || item.title || '';
              const IconComponent = activityStr.includes('Culto') ? Flame :
                activityStr.includes('Reunião') ? Users :
                  activityStr.includes('Jantar') ? Sparkles : Heart;
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
          <h2>Liderança</h2>
          <p className="section-subtitle">Casais que servem com amor e dedicação</p>

          <div className="team-grid">
            {data.team?.map((member, index) => (
              <div key={index} className="team-card">
                <img src={transformImageLink(member.photo)} alt={member.name} className="team-photo" />
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
            <h2>Nossa História</h2>
          </div>
          <p className="section-subtitle">Momentos inesquecíveis da nossa família ADMAC</p>

          <div className="gallery-grid">
            {data.gallery?.map((photo, index) => (
              <div key={index} className="gallery-item">
                <img src={transformImageLink(photo.url)} alt={photo.caption} />
                <div className="gallery-overlay">
                  <span>{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Birthdays Section */}
      {data.birthdays && (
        <section className="birthdays-section">
          <div className="container">
            <div className="section-header">
              <Gift size={32} />
              <h2>{data.birthdays.title || 'Aniversários de Casamento'}</h2>
            </div>
            <p className="section-subtitle">{data.birthdays.text || 'Celebrando as uniões abençoadas pelo Senhor!'}</p>

            <div className="birthdays-grid">
              {(data.birthdays.people || []).map((person, index) => (
                <div key={index} className="birthday-card">
                  <div className="birthday-photo-wrap">
                    <img 
                      src={transformImageLink(person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=c19a6b&color=fff`)} 
                      alt={person.name} 
                    />
                    <div className="birthday-badge">💒</div>
                  </div>
                  <h3>{person.name}</h3>
                  <span className="birthday-date">{person.date}</span>
                </div>
              ))}
              {(!data.birthdays.people || data.birthdays.people.length === 0) && (
                <div className="empty-birthdays" style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#a0a0a0' }}>
                  <p>Nenhum aniversário registrado para este mês.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="casais-cta">
        <div className="container">
          <Heart size={48} className="cta-icon" />
          <h2>Fortaleça sua Aliança!</h2>
          <p>Venha fazer parte do nosso ministério e descubra como o amor de Deus pode transformar o seu casamento.</p>
          <button className="cta-button">
            <Star size={18} /> Quero Participar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Casais;
