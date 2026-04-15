import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { supabase } from '../lib/supabase';
import { Shield, Calendar, Clock, Users, Camera, MessageSquare, Send, Heart, MapPin, Star, Play, Gift } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Homens.css';

const Homens = () => {
  const [data, , updateMinistryData] = useMinistryData('homens');
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
    <div className="homens-page">
      <div className="homens-hero">
        <div className="hero-slideshow">
          {(data.gallery && data.gallery.length > 0 ? data.gallery : [
            { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&h=900&fit=crop' },
            { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&h=900&fit=crop' },
            { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&h=900&fit=crop' }
          ]).map((photo, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${transformImageLink(photo.url)})` }}
            ></div>
          ))}
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Shield size={80} className="hero-icon" />
          <h1>{data.hero?.title || 'Ministério de Homens'}</h1>
          <p className="hero-subtitle">{data.hero?.subtitle || 'Homens firmes na fé, liderando em amor'}</p>
          {data.hero?.verse && (
            <div className="hero-verse">
              <p>{data.hero.verse}</p>
            </div>
          )}
        </div>
      </div>

      <section className="mission-section">
        <div className="container">
          <h2>{data.mission?.title || 'Nossa Missão'}</h2>
          <p className="mission-text">{data.mission?.text || 'Fortalecer homens na Palavra e no caráter de Cristo, para liderarem suas famílias e servirem à igreja.'}</p>
        </div>
      </section>


      <section className="schedule-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programação</h2>
          </div>
          <p className="section-subtitle">Participe dos encontros, estudos e ações do ministério</p>

          <div className="schedule-grid">
            {data.schedule.map((item, index) => {
              const IconComponent = item.icon || Users;
              return (
                <div key={index} className="schedule-card">
                  <div className="schedule-icon">
                    <IconComponent size={32} />
                  </div>
                  <div className="schedule-content">
                    <div className="schedule-header">
                      <h3>{item.activity || item.title || 'Atividade'}</h3>
                      <span className="day-badge">{item.day || item.date || ''}</span>
                    </div>
                    <p className="schedule-description">{item.description || ''}</p>
                    <div className="schedule-details">
                      {(item.time || item.location) && (
                        <div className="detail-item">
                          {item.time && <Clock size={16} />}
                          <span>{item.time}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Conheça os líderes do ministério de homens</p>
          <div className="team-grid">
            {data.team.map((member, index) => (
              <div key={index} className="team-card">
                <img src={transformImageLink(member.photo)} alt={member.name} className="team-photo" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <Camera size={32} />
            <h2>Galeria</h2>
          </div>
          <p className="section-subtitle">Registros de encontros, confraternizações e projetos</p>
          <div className="gallery-grid">
            {(data.gallery && data.gallery.length > 0 ? data.gallery : [
              { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: 'Encontro dos Homens' },
              { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop', caption: 'Estudo Bíblico' },
              { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop', caption: 'Confraternização' },
              { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop', caption: 'Louvor e Oração' },
              { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop', caption: 'Retiro' }
            ]).map((item, index) => (
              <div key={index} className="gallery-item">
                <img src={transformImageLink(item.url)} alt={item.caption || 'Foto'} />
                <div className="gallery-overlay">{item.caption || 'Momentos'}</div>
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
            <p className="section-subtitle">{data.birthdays.text || 'Celebramos a vida dos nossos irmãos!'}</p>


            <div className="birthdays-grid">
              {(data.birthdays.people || []).map((person, index) => (
                <div key={index} className="birthday-card">
                  <div className="birthday-photo-wrap">
                    <img 
                      src={transformImageLink(person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=3498db&color=fff`)} 
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

      <section className="homens-cta">
        <div className="container">
          <Star size={40} className="cta-icon" />
          <h2>Junte-se ao Ministério de Homens</h2>
          <p>Faça parte de uma comunidade de homens comprometidos com Cristo, família e serviço.</p>
          <div className="cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="tel:+5561993241084" className="cta-button">
              <Heart size={18} /> Entrar em Contato
            </a>
            {data.hero?.testimonyUrl && (
              <a 
                href={data.hero.testimonyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="cta-button secondary"
                style={{ background: 'transparent', border: '2px solid #d4af37', color: '#d4af37' }}
              >
                <MessageSquare size={18} /> Enviar Testemunho
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homens;
