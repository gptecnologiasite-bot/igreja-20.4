import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { supabase } from '../lib/supabase';
import { Heart, Calendar, Clock, Users, Camera, MessageSquare, Send, Star, BookOpen, Sparkles, Crown, Gift } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Mulheres.css';

const Mulheres = () => {
  const [data, , updateMinistryData] = useMinistryData('mulheres');
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
    <div className="mulheres-page">
      {/* Hero Section */}
      <div className="mulheres-hero">
        <div className="hero-slideshow">
          {data.gallery?.map((photo, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${transformImageLink(photo.url)})` }}
            ></div>
          ))}
        </div>
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
            {data.schedule?.map((item, index) => {
              // Default icon logic
              const activityStr = item.activity || item.title || '';
              const IconComponent = activityStr.includes('EBD') ? BookOpen :
                activityStr.includes('Célula') ? Users :
                  activityStr.includes('Café') ? Sparkles : Heart;
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
            <h2>Galeria de Fotos</h2>
          </div>
          <p className="section-subtitle">Momentos especiais do ministério</p>

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
              <h2>{data.birthdays.title || 'Aniversariantes do Mês'}</h2>
            </div>
            <p className="section-subtitle">{data.birthdays.text || 'Celebramos a vida de nossas amadas irmãs!'}</p>

            {data.birthdays.videoUrl && (
              <div className="birthday-video-wrapper" style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                {data.birthdays.videoUrl.includes('youtube.com') || data.birthdays.videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="400"
                    src={data.birthdays.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                    title="Vídeo de Aniversariantes"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    controls 
                    width="100%" 
                    src={transformImageLink(data.birthdays.videoUrl)}
                  />
                )}
              </div>
            )}

            <div className="birthdays-grid">
              {(data.birthdays.people || []).map((person, index) => (
                <div key={index} className="birthday-card">
                  <div className="birthday-photo-wrap">
                    <img 
                      src={transformImageLink(person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=e91e63&color=fff`)} 
                      alt={person.name} 
                    />
                    <div className="birthday-badge">🎂</div>
                  </div>
                  <h3>{person.name}</h3>
                  <span className="birthday-date">{person.date}</span>
                </div>
              ))}
              {(!data.birthdays.people || data.birthdays.people.length === 0) && (
                <div className="empty-birthdays">
                  <p>Nenhum aniversariante este mês.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
