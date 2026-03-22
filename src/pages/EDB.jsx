import React, { useState } from 'react';
import { BookOpen, Users, Clock, MapPin, GraduationCap, UserCheck, Download, Camera, MessageSquare, Send } from 'lucide-react';
import { transformImageLink } from '../lib/dbUtils';
import { useMinistryData } from '../hooks/useMinistryData';
import { supabase } from '../lib/supabase';
import '../css/EDB.css';

const EDB = () => {
  const [data] = useMinistryData('ebd');
  const [testimonial, setTestimonial] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      category: 'ebd',
      ...testimonial,
      photo_url: photoUrl,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('site_messages').insert(payload);
      if (error) throw error;
      alert('Testemunho enviado com sucesso! Será analisado pela nossa equipe.');
      setTestimonial({ name: '', email: '', message: '' });
      setPhotoFile(null);
    } catch (err) {
      console.error('Error sending testimonial:', err);
      try {
        const backups = JSON.parse(localStorage.getItem('admac_messages_backup') || '[]');
        backups.push(payload);
        localStorage.setItem('admac_messages_backup', JSON.stringify(backups));
        alert('Testemunho enviado com sucesso! (Salvo localmente). Será analisado.');
        setTestimonial({ name: '', email: '', message: '' });
        setPhotoFile(null);
      } catch {
        alert('Erro ao enviar testemunho. Tente novamente mais tarde.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="edb-page">
      {/* Hero Section */}
      <div className="edb-hero">
        <GraduationCap size={64} className="hero-icon" />
        <h1>{data.hero?.title || 'Escola Bíblica Dominical'}</h1>
        <p className="hero-subtitle">{data.hero?.subtitle || 'Crescendo no conhecimento'}</p>
      </div>

      {/* Info Section */}
      <div className="edb-info">
        <div className="info-grid">
          <div className="info-item">
            <Clock className="icon" />
            <div>
              <strong>Horário</strong>
              <p>{data.info?.time || 'Domingos, 9h'}</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin className="icon" />
            <div>
              <strong>Local</strong>
              <p>{data.info?.location || 'ADMAC'}</p>
            </div>
          </div>
          <div className="info-item">
            <Users className="icon" />
            <div>
              <strong>Para Todos</strong>
              <p>{data.info?.audience || 'Todas as idades'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Section */}
      <div className="classes-section">
        <h2>Nossas Classes</h2>
        <p className="section-subtitle">Encontre a classe ideal para você ou sua família</p>

        <div className="classes-grid">
          {data.schedule && data.schedule.length > 0 ? (
            data.schedule.map((classItem, index) => {
              const className = classItem.title || classItem.class || `Classe ${index + 1}`;
              // Default icon logic
              const IconComponent = className.includes('Juniores') ? Users :
                className.includes('Adolescentes') ? UserCheck :
                  className.includes('Jovens') ? UserCheck : GraduationCap;
              return (
                <div key={index} className="class-card">
                  <div className="class-header">
                    <IconComponent className="class-icon" size={32} />
                    <div>
                      <h3>{className}</h3>
                      {(classItem.date || classItem.age) && (
                        <span className="age-badge">{classItem.date || classItem.age}</span>
                      )}
                    </div>
                  </div>
                  {classItem.description && (
                    <p className="class-description">{classItem.description}</p>
                  )}

                  {/* Teacher Section */}
                  {(classItem.image || classItem.teacher || classItem.time) && (
                    <div className="teacher-section">
                      <img
                        src={classItem.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(classItem.teacher || classItem.time || 'Professor')}
                        alt={classItem.teacher || classItem.time || 'Professor'}
                        className="teacher-photo"
                      />
                      <div className="teacher-info">
                        <strong>Professor(a)</strong>
                        <p>{classItem.teacher || classItem.time || 'A definir'}</p>
                      </div>
                    </div>
                  )}

                  {(classItem.location || classItem.room) && (
                    <div className="class-details">
                      <div className="detail-item">
                        <strong>Sala:</strong> {classItem.location || classItem.room}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button className="download-btn">
                    <Download size={18} />
                    Baixar Material
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Nenhuma classe cadastrada no momento. Em breve teremos novidades!
            </p>
          )}
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Líderes comprometidos com o ensino da Palavra</p>

          <div className="team-grid">
            {data.team && data.team.length > 0 ? (
              data.team.map((member, index) => (
                <div key={index} className="team-card">
                  <img src={transformImageLink(member.photo) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name || 'Membro')} alt={member.name || 'Membro'} className="team-photo" />
                  <h3>{member.name || 'Membro'}</h3>
                  <p>{member.role || ''}</p>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Informações da equipe em breve.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      {data.testimonials && data.testimonials.length > 0 && (
        <div className="testimonials-section">
          <div className="container">
            <h2>Depoimentos</h2>
            <p className="section-subtitle">O que dizem os alunos da nossa EBD</p>
            <div className="testimonials-grid">
              {data.testimonials.map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="testimonial-content">
                    <p>"{t.text}"</p>
                  </div>
                  <div className="testimonial-author">
                    <img src={transformImageLink(t.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'Aluno')}&background=random`} alt={t.name} />
                    <div>
                      <strong>{t.name}</strong>
                      {t.age && <span>{t.age} anos</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Form Section */}
      <section className="testimonial-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Compartilhe Seu Testemunho</h2>
          </div>
          <p className="section-subtitle">Como a EBD tem transformado sua vida?</p>

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
                  placeholder="Compartilhe sua experiência conosco..."
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

      {/* Gallery Section */}
      <div className="gallery-section">
        <div className="container">
          <div className="section-header">
            <Camera size={32} />
            <h2>Galeria de Fotos</h2>
          </div>
          <p className="section-subtitle">Momentos especiais da nossa EBD</p>

          <div className="gallery-grid">
            {data.gallery && data.gallery.length > 0 ? (
              data.gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={transformImageLink(photo.url)} alt={photo.caption || 'Foto da EBD'} />
                  <div className="gallery-overlay">
                    <span>{photo.caption || 'Momentos especiais'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Galeria de fotos em breve.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="edb-cta">
        <h2>Venha Fazer Parte!</h2>
        <p>A EBD é um momento especial de aprendizado e comunhão. Traga sua família e cresça conosco no conhecimento de Deus.</p>
        <button className="cta-button">
          <BookOpen size={18} /> Quero Participar
        </button>
      </div>
    </div>
  );
};

export default EDB;
