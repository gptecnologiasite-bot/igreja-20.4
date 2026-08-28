import React from 'react';
import { transformImageLink } from '../lib/dbUtils';
import { Heart, Calendar, MessageSquare, Clock, Play, Sparkles } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Lares.css';

/**
 * ATUALIZAÇÃO - MINISTÉRIO DE INTERCESSÃO
 * - Removido formulário de pedidos de oração (conforme solicitado pelo cliente).
 * - Adicionado suporte a link de convite do WhatsApp via Painel Administrativo.
 * - Centralizado os cards de agendamento para melhor visualização.
 * - Limpeza de código e correção de erros de linting para deploy.
 */


const Intercessao = () => {
  const [data] = useMinistryData('intercessao');

  return (
    <div className="lares-page">
      {/* Hero Section */}
      <div className="lares-hero" style={{
        backgroundImage: `url(${data?.hero?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80'})`,
        backgroundBlendMode: 'overlay'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Intercessão • ADMAC</span>
          {data?.whatsappUrl ? (
            <MessageSquare size={80} className="hero-icon" color="#25D366" style={{ filter: 'drop-shadow(0 0 20px rgba(37, 211, 102, 0.4))' }} />
          ) : (
            <Heart size={80} className="hero-icon" />
          )}
          <h1>{data?.hero?.title || 'Ministério de Intercessão'}</h1>
          <p className="hero-subtitle">{data?.hero?.subtitle || 'Clamando ao Senhor em todo o tempo'}</p>
          <div className="hero-verse">
            <p>{data?.hero?.verse || '"Orai sem cessar." - 1 Tessalonicenses 5:17'}</p>
          </div>
          {data?.whatsappUrl && (
            <a 
              href={data.whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="submit-btn" 
              style={{ marginTop: '2rem', background: '#25D366', maxWidth: '300px', margin: '2rem auto 0' }}
            >
              <MessageSquare size={20} />
              Entrar no Grupo de Oração
            </a>
          )}
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>{data?.mission?.title || 'Nossa Missão'}</h2>
          <p className="mission-text">
            {data?.mission?.text || 'Sustentar a igreja, seus ministérios e famílias através da oração intercessória.'}
          </p>
        </div>
      </section>

      {/* Spotify Podcast Section */}
      <section className="video-section">
        <div className="container">
          <div className="section-header">
            <Play size={32} />
            <h2>Ouça Nosso Podcast</h2>
          </div>
          <p className="section-subtitle">Mensagens de oração e intercessão</p>

          <div className="video-wrapper">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/show/2lzm9pXbj4PCoWcxsFzDtf?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule-section" style={{ background: 'var(--bg-color)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Agenda de Oração</h2>
          </div>
          <p className="section-subtitle">Participe dos nossos encontros de intercessão</p>

          <div className="schedule-grid">
            {(data?.schedule || []).map((item, index) => (
              <div key={index} className="schedule-card">
                <div className="schedule-card-head">
                  <Clock size={24} />
                  <h3>{item.day}</h3>
                </div>
                <p className="schedule-time">{item.time}</p>
                <p className="schedule-activity">{item.activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section / WhatsApp Invitation */}
      <section className="team-section">
        <div className="container">
          {data?.whatsappUrl ? (
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <div className="section-header">
                <MessageSquare size={40} color="#25D366" />
                <h2>Corrente de Intercessão</h2>
                <p className="section-subtitle">Substituímos a galeria de fotos pelo nosso grupo oficial de oração</p>
              </div>
              
              <div className="team-card whatsapp-card">
                <div className="whatsapp-icon-wrap">
                  <MessageSquare size={50} color="#fff" />
                </div>
                <h3 className="whatsapp-title">Entre em Nosso Grupo</h3>
                <p className="whatsapp-text">
                  A nossa equipe de intercessores está reunida no WhatsApp. <br/>
                  Clique abaixo para entrar e deixar seus pedidos ou orar conosco em tempo real.
                </p>
                <a 
                  href={data.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="whatsapp-btn"
                >
                  <MessageSquare size={24} />
                  ACESSAR WHATSAPP AGORA
                </a>
              </div>
            </div>
          ) : (
            <>
              <h2>Nossa Equipe</h2>
              <p className="section-subtitle">Conheça os líderes do ministério de intercessão</p>
              <div className="team-grid">
                {(data?.team || []).map((member, idx) => (
                  <div key={idx} className="team-card">
                    <div className="team-photo-wrap">
                      <img src={transformImageLink(member.photo)} alt={member.name} className="team-photo" />
                    </div>
                    <h3>{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <div className="team-excellence">
                      <Sparkles size={14} />
                      <span>Servindo a Deus com excelência</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Intercessao;
