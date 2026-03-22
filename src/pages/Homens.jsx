import React, { useState, useEffect } from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { supabase } from '../lib/supabase';
import { Shield, Calendar, Clock, Users, Camera, MessageSquare, Send, Heart, MapPin, Star, Play, Gift } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Homens.css';

const Homens = () => {
  const [testimonial, setTestimonial] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [data] = useMinistryData('homens');
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
      category: 'homens',
      ...testimonial,
      photo_url: photoUrl,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('site_messages').insert(payload);
      if (error) throw error;
      alert('Testemunho enviado com sucesso! Obrigado por compartilhar.');
      setTestimonial({ name: '', age: '', email: '', phone: '', city: '', message: '' });
      setPhotoFile(null);
    } catch (err) {
      console.error('Error sending:', err);
      const backups = JSON.parse(localStorage.getItem('admac_messages_backup') || '[]');
      backups.push(payload);
      localStorage.setItem('admac_messages_backup', JSON.stringify(backups));
      alert('Testemunho enviado com sucesso! (Salvo localmente).');
      setTestimonial({ name: '', age: '', email: '', phone: '', city: '', message: '' });
      setPhotoFile(null);
    } finally {
      setUploading(false);
    }
  };

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
                <img src={item.url} alt={item.caption || 'Foto'} />
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

      {/* Testimonials Display */}
      <section className="testimonials-display-section">
        <div className="container">
          <h2>Testemunhos</h2>
          <p className="section-subtitle">Veja como Deus tem fortalecido nossos homens</p>

          <div className="testimonials-grid">
            {data.testimonials?.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#64748b" color="#64748b" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={transformImageLink(testimonial?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial?.name || 'Homem')}&background=random`} alt={testimonial?.name} />
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

      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Compartilhe um Testemunho</h2>
          </div>
          <p className="section-subtitle">Conte como Deus tem te fortalecido neste ministério</p>
          <div className="form-wrapper">
            <form className="testimonial-form" onSubmit={handleSubmit}>
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
                <label>Mensagem</label>
                <textarea value={testimonial.message} onChange={(e) => setTestimonial({ ...testimonial, message: e.target.value })} rows={4} />
              </div>
              <button className="submit-btn" type="submit" disabled={uploading}>
                <Send size={16} /> {uploading ? 'Enviando...' : 'Enviar'}
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
