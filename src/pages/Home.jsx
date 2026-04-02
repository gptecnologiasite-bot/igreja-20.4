// ================================================================
// Home.jsx — Página inicial do site ADMAC
// Exibe: carrossel hero, seção de boas-vindas com pastores,
// podcast Spotify, vídeos recentes, programação semanal,
// cards de ministérios, aniversariantes e atividades em destaque.
// Todos os dados são carregados dinamicamente via Supabase.
// ================================================================

import React, { useState, useEffect } from "react";
import {
  Calendar, // Ícone do calendário na programação semanal
  Clock,    // Ícone de horário nos cards de programação
  MapPin,   // Ícone de localização
  Book,     // Ícone padrão de fallback para eventos
  Phone,    // Ícone de telefone nos botões CTA
  ArrowRight, // Seta nos cards de ministérios
  Bell,     // Sino de notificações (Home)
  Heart,    // Ícone de coração na programação
  Music,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import HeroCarousel from "../components/HeroCarousel";
import PastorCarousel from "../components/PastorCarousel";
import RecentVideos from "../components/RecentVideos";
import { supabase } from "../lib/supabase";
import { INITIAL_HOME_DATA } from "../lib/constants";
import { deepMerge, transformImageLink, parseSafeJson } from "../lib/dbUtils";
import { usePageUpdate } from "../hooks/usePageUpdate";
import { useSiteData } from "../context/SiteContext";


const Home = () => {
  const { pastorsData } = useSiteData();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Estado principal com os dados da home (carrossel, welcome, agenda, etc.)
  const [data, setData] = useState(INITIAL_HOME_DATA);
  // Lista consolidada de aniversariantes de todos os ministérios
  const [allBirthdays, setAllBirthdays] = useState([]);

  const loadData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'home').single();

      if (error) {
        console.error('❌ [Supabase] Falha ao carregar Home:', error.message, error.details);
        console.log('💡 DICA: Verifique se a tabela site_settings existe e se o RLS está liberado.');
        
        // Fallback para localStorage
        const raw = localStorage.getItem('admac_site_settings:home');
        if (raw) {
          try {
            const local = JSON.parse(raw);
            setData(deepMerge(INITIAL_HOME_DATA, local));
            console.info('[Storage] Usando dados locais para a Home.');
            return;
          } catch (e) {
            console.error('[Storage] JSON inválido no localStorage:', e);
          }
        }
        
        // Fallback final: dados estáticos
        setData(INITIAL_HOME_DATA);
        return;
      }

      if (dbData && dbData.data) {
        const parsed = parseSafeJson(dbData.data);
        if (parsed && typeof parsed === 'object') {
          setData(deepMerge(INITIAL_HOME_DATA, parsed));
          // Cacheia para uso offline futuro
          localStorage.setItem('admac_site_settings:home', JSON.stringify(parsed));
        } else {
          console.warn('⚠️ [Supabase] Dados da Home vieram em formato inválido ou vazios.');
        }
      }
    } catch (err) {
      console.error('[App] Erro crítico no loadData:', err);
      setData(INITIAL_HOME_DATA);
    }
  };

  // Carrega os dados da home ao montar o componente
  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);


  // Sincronização automática via usePageUpdate
  usePageUpdate(['home', 'videos'], loadData);



  // Carrega aniversariantes de todas as áreas de uma só vez (Batch Fetch)
  useEffect(() => {
    const loadBirthdays = async () => {
      try {
        const ministryKeys = [
          'ministry_kids', 'ministry_louvor', 'ministry_jovens', 
          'ministry_mulheres', 'ministry_homens', 'ministry_lares', 
          'ministry_retiro', 'ministry_social', 'ministry_ebd', 
          'ministry_midia', 'ministry_intercessao', 'ministry_missoes', 
          'ministry_revista'
        ];

        const { data: dbResults, error } = await supabase
          .from('site_settings')
          .select('key, data')
          .in('key', ministryKeys);

        if (error) throw error;

        const results = [];
        dbResults?.forEach(row => {
          const d = parseSafeJson(row.data);
          if (d?.birthdays?.people?.length > 0) {
            const label = d?.hero?.title || row.key.replace('ministry_', '');
            d.birthdays.people.forEach(person => {
              results.push({ ...person, ministryLabel: label });
            });
          }
        });

        // Ordenação eficiente
        results.sort((a, b) => {
          const [da, ma] = (a.date || '99/99').split('/').map(n => parseInt(n) || 99);
          const [db, mb] = (b.date || '99/99').split('/').map(n => parseInt(n) || 99);
          return ma !== mb ? ma - mb : da - db;
        });

        setAllBirthdays(results);
      } catch (err) {
        console.warn("[Home] Erro ao carregar aniversariantes em lote:", err.message);
      }
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
              <h1>{data.welcome.title}</h1>
              <p>{data.welcome.text1}</p>
              <p>{data.welcome.text2}</p>
              
              <div className="contact-dropdown-container" ref={dropdownRef}>
                <button 
                  className="welcome-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Phone size={18} /> {data.welcome.buttonText || "Entre em Contato"}
                </button>

                <div className={`contact-dropdown-menu ${showDropdown ? 'active' : ''}`}>
                  {(pastorsData || []).map((pastor) => (
                    <a 
                      key={pastor.id} 
                      href={`https://wa.me/${pastor.phone || '5561993241084'}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-item"
                    >
                      <div className="contact-photo">
                        {pastor.photo ? (
                          <img src={transformImageLink(pastor.photo)} alt={pastor.name} />
                        ) : (
                          <Phone size={18} />
                        )}
                      </div>
                      <div className="contact-info">
                        <span className="contact-name">{pastor.name}</span>
                        <span className="contact-role">{pastor.role}</span>
                      </div>
                      <MessageCircle size={14} className="contact-whatsapp-icon" />
                    </a>
                  ))}
                  {(!pastorsData || pastorsData.length === 0) && (
                    <div style={{ color: '#7c82a0', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
                      Pressione para ver contatos
                    </div>
                  )}
                </div>
              </div>
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
              // Mapeia strings de ícone do banco para componentes Lucide reais
              const iconMap = { Book, Music, Heart, Clock, Calendar, Bell, Phone, ArrowRight };
              const IconComponent = (typeof item.iconType === 'string' && iconMap[item.iconType])
                ? iconMap[item.iconType]
                : (typeof item.icon === 'function' ? item.icon : Book);
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
                  src={transformImageLink(person.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'A')}&background=d4af37&color=000&bold=true&size=150`}
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
      <section className="activities-home-section" style={{ padding: '4rem 0', background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '.5rem' }}>Atividades em Destaque</h2>
          <p className="section-subtitle">Veja o que está acontecendo na igreja</p>
          <div className="card-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {(data.activities || []).map((a, idx) => (
              <div key={idx} className="card" style={{ border: '1px solid rgba(212,175,55,0.25)', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                <img
                  className="card-img-top"
                  src={transformImageLink(a.image) || '/imagem/admac.png'}
                  alt={a.title || 'Atividade'}
                  style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'contain', background: '#000', display: 'block' }}
                  onError={(e) => { e.currentTarget.src = '/imagem/admac.png'; }}
                />
                <div className="card-body" style={{ padding: '1rem' }}>
                  <h5 className="card-title" style={{ marginBottom: '.5rem' }}>{a.title || 'Atividade'}</h5>
                  {a.description ? <p className="card-text" style={{ color: 'var(--text-muted)' }}>{a.description}</p> : null}
                  {a.date ? <p className="card-text"><small className="text-muted">{a.date}</small></p> : null}
                </div>
              </div>
            ))}
          </div>
          {(data.activities || []).length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Nenhuma atividade cadastrada
            </div>
          )}
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
            <a
              href={
                !data.cta?.secondaryLink ? "tel:+5561993241084" :
                  (data.cta.secondaryLink.match(/^(http|tel:|mailto:|\/)/) ? data.cta.secondaryLink : `tel:+55${data.cta.secondaryLink.replace(/\D/g, '')}`)
              }
              className="cta-home-btn secondary"
            >
              <Phone size={18} /> {data.cta?.secondaryBtn || 'Ligar Agora'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
