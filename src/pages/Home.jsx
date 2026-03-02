// ================================================================
// Home.jsx — Página inicial do site ADMAC
// Exibe: carrossel hero, seção de boas-vindas com pastores,
// podcast Spotify, vídeos recentes, programação semanal,
// cards de ministérios, aniversariantes e atividades em destaque.
// Todos os dados são carregados dinamicamente do DatabaseService.
// ================================================================

import React, { useState, useEffect } from "react";
import {
  Calendar, // Ícone do calendário na programação semanal
  Clock,    // Ícone de horário nos cards de programação
  MapPin,   // Ícone de localização
  Book,     // Ícone padrão de fallback para eventos
  Phone,    // Ícone de telefone nos botões CTA
  ArrowRight, // Seta nos cards de ministérios
} from "lucide-react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import HeroCarousel from "../components/HeroCarousel";
import ActivitiesCarousel from "../components/ActivitiesCarousel";
import PastorCarousel from "../components/PastorCarousel";
import RecentVideos from "../components/RecentVideos";
import DatabaseService from "../services/DatabaseService";

const Home = () => {
  // Estado principal com os dados da home (carrossel, welcome, agenda, etc.)
  const [data, setData] = useState(DatabaseService.getHomeDataDefault());
  // Lista consolidada de aniversariantes de todos os ministérios
  const [allBirthdays, setAllBirthdays] = useState([]);

  // Carrega os dados da home ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      const homeData = await DatabaseService.getHomeData();
      setData(homeData);
    };
    loadData();
  }, []);

  // Carrega aniversariantes de todos os ministérios e ordena por data (DD/MM)
  useEffect(() => {
    const ministryIds = ['kids', 'louvor', 'jovens', 'mulheres', 'homens', 'lares', 'retiro', 'social', 'ebd', 'midia'];
    const loadBirthdays = async () => {
      const results = [];
      for (const id of ministryIds) {
        try {
          const d = await DatabaseService.getMinistry(id);
          // Adiciona aniversariantes encontrados junto com o nome do ministério
          if (d?.birthdays?.people && d.birthdays.people.length > 0) {
            d.birthdays.people.forEach(person => {
              results.push({ ...person, ministryLabel: d?.hero?.title || id });
            });
          }
        } catch { /* Ignora ministério com erro e continua */ }
      }
      // Ordena por mês e depois por dia (formato DD/MM)
      results.sort((a, b) => {
        const parseParts = s => {
          const p = (s || '').split('/');
          return [parseInt(p[0]) || 99, parseInt(p[1]) || 99];
        };
        const [da, ma] = parseParts(a.date);
        const [db, mb] = parseParts(b.date);
        return ma !== mb ? ma - mb : da - db;
      });
      setAllBirthdays(results);
    };
    loadBirthdays();
  }, []);

  return (
    <div className="home">
      {/* ── Carrossel Hero ── */}
      <HeroCarousel slides={data.carousel} />

      {/* ── Seção de Boas-Vindas com Carrossel de Pastores ── */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-content">
            {/* Suporta múltiplos pastores (array) ou pastor único (legado) */}
            <PastorCarousel pastors={data.pastors || (data.pastor ? [data.pastor] : [])} />
            <div className="welcome-text">
              <h2>{data.welcome.title}</h2>
              <p>{data.welcome.text1}</p>
              <p>{data.welcome.text2}</p>
              <Link to="/contato" className="welcome-btn">
                <Phone size={18} /> Entre em Contato
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seção do Podcast Spotify ── */}
      <section className="spotify-section">
        <div className="container">
          <h2>Ouça Nossas Mensagens</h2>
          <p className="section-subtitle">
            Podcast com as pregações e estudos bíblicos da ADMAC
          </p>
          <div className="spotify-wrapper">
            {/* URL do Spotify configurável via painel admin */}
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "12px" }}
              src={data.spotifyUrl || "https://open.spotify.com/embed/episode/6vf8aTHBG3ms8DGo5jCsAG?utm_source=generator"}
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

      {/* ── Vídeos Recentes do YouTube ── */}
      <RecentVideos limit={4} />

      {/* ── Programação Semanal ── */}
      <section className="schedule-home-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programação Semanal</h2>
          </div>
          <p className="section-subtitle">
            Participe dos nossos cultos e atividades
          </p>

          <div className="schedule-home-grid">
            {data.schedule.map((item, index) => {
              // Usa o ícone da programação ou fallback para o ícone Book
              const IconComponent = item.icon || Book;
              return (
                <div key={index} className="schedule-home-card">
                  <div className="schedule-home-day">{item.day}</div>
                  <div className="schedule-home-time">
                    <Clock size={20} />
                    {item.time}
                  </div>
                  <div className="schedule-home-event">
                    <IconComponent size={24} />
                    <span>{item.event}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Endereço fixo da igreja */}
          <div className="location-info">
            <MapPin size={20} />
            <span>QN 516 - Samambaia, Brasília - DF</span>
          </div>
        </div>
      </section>

      {/* ── Seção de Ministérios ── */}
      <section className="ministries-home-section">
        <div className="container">
          <h2>Nossos Ministérios</h2>
          <p className="section-subtitle">
            Conheça as áreas de atuação da nossa igreja
          </p>

          <div className="ministries-home-grid">
            {/* Ministérios configuráveis pelo painel admin */}
            {(data.ministries || []).map((ministry, index) => (
              <Link
                to={ministry.link}
                key={index}
                className="ministry-home-card"
                style={{ borderColor: ministry.color }}
              >
                <div
                  className="ministry-home-icon"
                  style={{ background: ministry.color }}
                >
                  {ministry.icon}
                </div>
                <h3>{ministry.title}</h3>
                <p>{ministry.description}</p>
                <div
                  className="ministry-home-arrow"
                  style={{ color: ministry.color }}
                >
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção de Aniversariantes — sempre visível ── */}
      {/* CORREÇÃO: removido o wrapper desnecessário {( ... )} ao redor da section */}
      <section className="birthdays-home-section" style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, var(--primary-dark, #0d0d1a) 0%, var(--surface-color, #1a1a2e) 100%)'
      }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '0.5rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🎂</span>
            <h2 style={{ margin: '0 0.5rem', fontSize: '2rem', fontWeight: 700 }}>Aniversariantes dos Ministérios</h2>
          </div>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Vamos celebrar com quem faz parte da nossa família!
          </p>

          {/* Grid de cards dos aniversariantes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1.5rem',
            justifyContent: 'center'
          }}>
            {allBirthdays.map((person, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '20px',
                  padding: '1.8rem 1rem 1.4rem',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(212,175,55,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Avatar: usa foto cadastrada ou avatar automático gerado por nome */}
                <img
                  src={person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'A')}&background=d4af37&color=000&bold=true&size=150`}
                  alt={person.name}
                  style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4af37', boxShadow: '0 0 0 4px rgba(212,175,55,0.2)' }}
                />
                {/* Nome do aniversariante */}
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.2, marginTop: '0.4rem' }}>
                  {person.name || '—'}
                </div>
                {/* Data de aniversário (formato DD/MM) */}
                {person.date && (
                  <div style={{ fontSize: '0.88rem', color: '#d4af37', fontWeight: 700, background: 'rgba(212,175,55,0.12)', padding: '0.2rem 0.7rem', borderRadius: '20px' }}>
                    🎂 {person.date}
                  </div>
                )}
                {/* Nome do ministério de origem */}
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>
                  {person.ministryLabel}
                </div>
              </div>
            ))}
          </div>

          {/* Mensagem de placeholder quando não há aniversariantes cadastrados */}
          {allBirthdays.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontStyle: 'italic' }}>
              🎂 Nenhum aniversariante cadastrado ainda. Adicione pelo Painel → Configurações → Editar Ministério → Aniversariantes.
            </div>
          )}
        </div>
      </section>

      {/* ── Atividades em Destaque ── */}
      <section className="activities-home-section">
        <div className="container">
          <h2>Atividades em Destaque</h2>
          <p className="section-subtitle">
            Veja o que está acontecendo na igreja
          </p>
          {/* Carrossel de atividades configurável pelo painel admin */}
          <ActivitiesCarousel activities={data.activities} />
        </div>
      </section>

      {/* ── Seção CTA (Call to Action) ── */}
      <section className="cta-home-section">
        <div className="container">
          <h2>{data.cta?.title || 'Faça Parte da Nossa Família'}</h2>
          <p>
            {data.cta?.subtitle || 'Venha nos visitar e experimente o amor de Deus em nossa comunidade'}
          </p>
          <div className="cta-home-buttons">
            {/* Botão primário: link configurável (padrão: /contato) */}
            <Link to={data.cta?.primaryLink || "/contato"} className="cta-home-btn primary">
              {data.cta?.primaryBtn || 'Quero Visitar'}
            </Link>
            {/* Botão secundário: telefone configurável */}
            <a href={data.cta?.secondaryLink || "tel:+5561993241084"} className="cta-home-btn secondary">
              <Phone size={18} /> {data.cta?.secondaryBtn || 'Ligar Agora'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
