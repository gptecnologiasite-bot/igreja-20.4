import React, { useState } from 'react';
import { Shield, Calendar, Clock, Users, Camera, MessageSquare, Send, Heart, MapPin, Star, Play } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';

const Homens = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });

  const [data] = useMinistryData('homens');

  return (
    <div className="homens-page">
      <div className="homens-hero">
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

      {data.hero?.videoUrl && (
        <section className="video-section">
          <div className="container">
            <div className="section-header">
              <Play size={32} />
              <h2>Conheça o Ministério</h2>
            </div>
            <p className="section-subtitle">Assista ao vídeo de apresentação</p>
            <div className="video-wrapper">
              <iframe
                width="100%"
                height="500"
                src={data.hero.videoUrl}
                title="Ministério de Homens"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

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
                <img src={member.photo} alt={member.name} className="team-photo" />
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
                <img src={item.url} alt={item.caption || 'Foto'} />
                <div className="gallery-overlay">{item.caption || 'Momentos'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Compartilhe um Testemunho</h2>
          </div>
          <p className="section-subtitle">Conte como Deus tem te fortalecido neste ministério</p>
          <div className="form-wrapper">
            <form className="testimonial-form" onSubmit={(e) => { e.preventDefault(); alert('Obrigado por compartilhar!'); }}>
              <div className="form-group">
                <label>Nome</label>
                <input type="text" value={testimonial.name} onChange={(e) => setTestimonial({ ...testimonial, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Idade</label>
                <input type="number" value={testimonial.age} onChange={(e) => setTestimonial({ ...testimonial, age: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={testimonial.email} onChange={(e) => setTestimonial({ ...testimonial, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="tel" value={testimonial.phone} onChange={(e) => setTestimonial({ ...testimonial, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input type="text" value={testimonial.city} onChange={(e) => setTestimonial({ ...testimonial, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea value={testimonial.message} onChange={(e) => setTestimonial({ ...testimonial, message: e.target.value })} rows={4} />
              </div>
              <button className="submit-btn" type="submit">
                <Send size={16} /> Enviar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="homens-cta">
        <div className="container">
          <Star size={40} className="cta-icon" />
          <h2>Junte-se ao Ministério de Homens</h2>
          <p>Faça parte de uma comunidade de homens comprometidos com Cristo, família e serviço.</p>
          <a href="tel:+5561993241084" className="cta-button"><Heart size={18} /> Entrar em Contato</a>
        </div>
      </section>
    </div>
  );
};

export default Homens;
