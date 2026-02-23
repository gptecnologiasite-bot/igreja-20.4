import React, { useState } from 'react';
import { Home, Users, Calendar, Camera, MessageSquare, Send, Heart, MapPin, Clock, Star, Play } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Lares.css';

const Lares = () => {
  const [registration, setRegistration] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredDay: ''
  });

  const [data] = useMinistryData('lares');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Cadastro enviado com sucesso! Em breve entraremos em contato.');
    setRegistration({ name: '', phone: '', email: '', address: '', preferredDay: '' });
  };

  return (
    <div className="lares-page">
      {/* Hero Section */}
      <div className="lares-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Home size={80} className="hero-icon" />
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

      {/* Video Section */}
      {data.hero.videoUrl && (
        <section className="video-section">
          <div className="container">
            <div className="section-header">
              <Play size={32} />
              <h2>Conheça o Ministério</h2>
            </div>
            <p className="section-subtitle">Assista ao vídeo e veja como funciona</p>

            <div className="video-wrapper">
              <iframe
                width="100%"
                height="500"
                src={data.hero.videoUrl}
                title="Ministério de Lares"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Conheça os líderes do ministério de lares</p>

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
          <p className="section-subtitle">Momentos especiais dos nossos encontros</p>

          <div className="gallery-cards">
            {(data.gallery && data.gallery.length > 0 ? data.gallery : [
              {
                title: 'Título do cartão',
                text: 'Este é um cartão mais amplo com texto de apoio abaixo, servindo como introdução natural a conteúdo adicional. Este conteúdo é um pouco mais extenso.',
                updated: 'Última atualização há 3 minutos'
              },
              {
                title: 'Título do cartão',
                text: 'Este cartão contém um texto de apoio abaixo, que serve como introdução natural a conteúdo adicional.',
                updated: 'Última atualização há 3 minutos'
              },
              {
                title: 'Título do cartão',
                text: 'Este é um cartão mais amplo com texto de apoio abaixo, servindo como uma introdução natural ao conteúdo adicional. Este cartão possui um conteúdo ainda mais extenso que o primeiro, para demonstrar a mesma altura da ação.',
                updated: 'Última atualização há 3 minutos'
              }
            ]).map((item, index) => (
              <div key={index} className="gallery-card">
                <div className="gallery-card-img">
                  {item.url ? <img src={item.url} alt={item.title || item.caption} /> : 'Image cap'}
                </div>
                <div className="gallery-card-body">
                  <h5 className="gallery-card-title">{item.title || 'Título do cartão'}</h5>
                  <p className="gallery-card-text">{item.text || item.caption || 'Texto de exemplo para o cartão.'}</p>
                </div>
                <div className="gallery-card-footer">
                  <small>{item.updated || 'Última atualização há 3 minutos'}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>Testemunhos</h2>
          <p className="section-subtitle">Veja o que os participantes dizem</p>

          <div className="testimonials-grid">
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#3498db" color="#3498db" />
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

      {/* Registration Form Section */}
      <section className="registration-form-section">
        <div className="container">
          <div className="section-header">
            <MessageSquare size={32} />
            <h2>Cadastre-se para Participar</h2>
          </div>
          <p className="section-subtitle">Preencha o formulário e participe de um lar perto de você</p>

          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  value={registration.name}
                  onChange={(e) => setRegistration({ ...registration, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={registration.phone}
                    onChange={(e) => setRegistration({ ...registration, phone: e.target.value })}
                    placeholder="(61) 99999-9999"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={registration.email}
                    onChange={(e) => setRegistration({ ...registration, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Endereço (Bairro) *</label>
                <input
                  type="text"
                  id="address"
                  value={registration.address}
                  onChange={(e) => setRegistration({ ...registration, address: e.target.value })}
                  placeholder="Seu bairro"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferredDay">Dia de Preferência</label>
                <select
                  id="preferredDay"
                  value={registration.preferredDay}
                  onChange={(e) => setRegistration({ ...registration, preferredDay: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="segunda">Segunda-feira</option>
                  <option value="terca">Terça-feira</option>
                  <option value="quarta">Quarta-feira</option>
                  <option value="quinta">Quinta-feira</option>
                  <option value="sexta">Sexta-feira</option>
                  <option value="sabado">Sábado</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                <Send size={18} /> Enviar Cadastro
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="lares-cta">
        <div className="container">
          <Home size={48} className="cta-icon" />
          <h2>Venha Fazer Parte!</h2>
          <p>Experimente a comunhão verdadeira em um ambiente familiar e acolhedor</p>
          <button className="cta-button">
            <Heart size={18} /> Quero Participar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Lares;
