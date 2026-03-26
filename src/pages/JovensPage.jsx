import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { supabase } from '../lib/supabase';
import { Zap, Calendar, Clock, Users, Camera, MessageSquare, Send, Heart, MapPin, Star, Music, Gamepad2 } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Jovens.css';

const Jovens = () => {
  const [data] = useMinistryData('jovens');
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
    <div className="jovens-page">
      {/* Hero Section */}
      <div className="jovens-hero">
        <div className="hero-slideshow">
          {data.gallery && data.gallery.map((photo, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${transformImageLink(photo.url)})` }}
            ></div>
          ))}
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Zap size={80} className="hero-icon" />
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
            <h2>Programação</h2>
          </div>
          <p className="section-subtitle">Participe das nossas atividades</p>

          <div className="schedule-grid">
            {data.schedule.map((item, index) => {
              // Default icon logic
              const IconComponent = item.activity.includes('EBD') ? Users :
                item.activity.includes('Célula') ? Heart :
                  item.activity.includes('Recreativa') ? Gamepad2 : Music;
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
                        <MapPin size={16} />
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
          <p className="section-subtitle">Conheça os líderes do ministério de jovens</p>

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
                <img src={transformImageLink(photo.url)} alt={photo.caption} />
                <div className="gallery-overlay">
                  <span>{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="jovens-cta">
        <div className="container">
          <Zap size={48} className="cta-icon" />
          <h2>Faça Parte!</h2>
          <p>Venha viver uma experiência transformadora com jovens que amam a Deus</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Participar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Jovens;
