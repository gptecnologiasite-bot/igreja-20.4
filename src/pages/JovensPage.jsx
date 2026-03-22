import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { supabase } from '../lib/supabase';
import { Zap, Calendar, Clock, Users, Camera, MessageSquare, Send, Heart, MapPin, Star, Music, Gamepad2 } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Jovens.css';

const Jovens = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    age: '',
    email: '',
    message: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let photoUrl = '';

    if (photoFile) {
      try {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(filePath, photoFile);
        
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('site-images')
            .getPublicUrl(filePath);
          if (publicUrlData) photoUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }

    const payload = {
      type: 'testimonial_submission',
      category: 'jovens',
      ...testimonial,
      photo_url: photoUrl,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('site_messages').insert(payload);
      if (error) throw error;
      alert('Testemunho enviado com sucesso! Obrigado por compartilhar.');
      setTestimonial({ name: '', age: '', email: '', message: '' });
      setPhotoFile(null);
    } catch (err) {
      console.error('Error sending:', err);
      const backups = JSON.parse(localStorage.getItem('admac_messages_backup') || '[]');
      backups.push(payload);
      localStorage.setItem('admac_messages_backup', JSON.stringify(backups));
      alert('Testemunho salvo localmente com sucesso! Obrigado por compartilhar.');
      setTestimonial({ name: '', age: '', email: '', message: '' });
      setPhotoFile(null);
    } finally {
      setUploading(false);
    }
  };

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

      {/* Testimonials Display */}
      <section className="testimonials-display-section">
        <div className="container">
          <h2>Testemunhos</h2>
          <p className="section-subtitle">Veja o que os jovens dizem</p>

          <div className="testimonials-grid">
            {data.testimonials?.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#e67e22" color="#e67e22" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={transformImageLink(testimonial?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial?.name || 'Jovem')}&background=random`} alt={testimonial?.name} />
                  <div>
                    <strong>{testimonial.name}</strong>
                    {testimonial.age && <span>{testimonial.age} anos</span>}
                  </div>
                </div>
              </div>
            ))}
            {(!data.testimonials || data.testimonials.length === 0) && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '2rem' }}>Nenhum testemunho publicado ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial Form Section */}
      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Deixe Seu Testemunho</h2>
          </div>
          <p className="section-subtitle">Compartilhe como Deus tem trabalhado em sua vida</p>

          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="testimonial-form">
              <div className="form-row">
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
                  <label htmlFor="age">Idade</label>
                  <input
                    type="number"
                    id="age"
                    value={testimonial.age}
                    onChange={(e) => setTestimonial({ ...testimonial, age: e.target.value })}
                    placeholder="Sua idade"
                    required
                  />
                </div>
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
                <label htmlFor="photo">Sua Foto (Opcional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'inline-block', fontSize: '0.9rem', color: 'var(--text-color)', transition: 'all 0.2s ease' }}>
                    {photoFile ? 'Trocar Foto' : 'Escolher Foto'}
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {photoFile && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{photoFile.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Seu Testemunho</label>
                <textarea
                  id="message"
                  value={testimonial.message}
                  onChange={(e) => setTestimonial({ ...testimonial, message: e.target.value })}
                  placeholder="Compartilhe sua história..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={uploading}>
                <Send size={18} /> {uploading ? 'Enviando...' : 'Enviar Testemunho'}
              </button>
            </form>
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
