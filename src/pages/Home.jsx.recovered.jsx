// ================================================================
// Home.jsx ÔÇö P├ígina inicial do site ADMAC
// Exibe: carrossel hero, se├º├úo de boas-vindas com pastores,
// podcast Spotify, v├¡deos recentes, programa├º├úo semanal,
// cards de minist├®rios, aniversariantes e atividades em destaque.
// Todos os dados s├úo carregados dinamicamente via Supabase.
// ================================================================

import React, { useState, useEffect } from "react";
import {
  Calendar, // ├ìcone do calend├írio na programa├º├úo semanal
  Clock,    // ├ìcone de hor├írio nos cards de programa├º├úo
  MapPin,   // ├ìcone de localiza├º├úo
  Book,     // ├ìcone padr├úo de fallback para eventos
  Phone,    // ├ìcone de telefone nos bot├Áes CTA
  ArrowRight, // Seta nos cards de minist├®rios
  Bell,     // Sino de notifica├º├Áes (Home)
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


const Home = () => {
  // Estado principal com os dados da home (carrossel, welcome, agenda, etc.)
  const [data, setData] = useState(INITIAL_HOME_DATA);
  // Lista consolidada de aniversariantes de todos os minist├®rios
  const [allBirthdays, setAllBirthdays] = useState([]);

  const loadData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'home').single();

      if (error) {
        console.error('ÔØî [Supabase] Falha ao carregar Home:', error.message, error.details);
        console.log('­ƒÆí DICA: Verifique se a tabela site_settings existe e se o RLS est├í liberado.');
        
        // Fallback para localStorage
        const raw = localStorage.getItem('admac_site_settings:home');
        if (raw) {
          try {
            const local = JSON.parse(raw);
            setData(deepMerge(INITIAL_HOME_DATA, local));
            console.info('[Storage] Usando dados locais para a Home.');
            return;
          } catch (e) {
            console.error('[Storage] JSON inv├ílido no localStorage:', e);
          }
        }
        
        // Fallback final: dados est├íticos
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
          console.warn('ÔÜá´©Å [Supabase] Dados da Home vieram em formato inv├ílido ou vazios.');
        }
      }
    } catch (err) {
      console.error('[App] Erro cr├¡tico no loadData:', err);
      setData(INITIAL_HOME_DATA);
    }
  };

  // Carrega os dados da home ao montar o componente
  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);


  // Sincroniza├º├úo autom├ítica via usePageUpdate
  usePageUpdate(['home', 'videos'], loadData);



  // Carrega aniversariantes de todas as ├íreas do site para exibir na Home
  useEffect(() => {
    const ministryIds = ['kids', 'louvor', 'jovens', 'mulheres', 'homens', 'lares', 'retiro', 'social', 'ebd', 'midia', 'intercessao', 'missoes', 'revista'];
    const loadBirthdays = async () => {
      const results = [];
      for (const id of ministryIds) {
        try {
          const { data: dbData } = await supabase
            .from('site_settings')
            .select('data')
            .eq('key', `ministry_${id}`).single();

          const raw = dbData?.data;
          const d = parseSafeJson(raw);
          // Adiciona aniversariantes encontrados junto com o nome do minist├®rio
          if (d?.birthdays?.people && d.birthdays.people.length > 0) {
            d.birthdays.people.forEach(person => {
              results.push({ ...person, ministryLabel: d?.hero?.title || id });
            });
          }
        } catch { /* Ignora minist├®rio com erro e continua */ }
      }
      // Ordena por m├¬s e depois por dia (formato DD/MM)
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


      {/* ÔöÇÔöÇ Carrossel Hero ÔöÇÔöÇ */}
      <HeroCarousel slides={data.carousel} />

      {/* ÔöÇÔöÇ Se├º├úo de Boas-Vindas com Carrossel de Pastores ÔöÇÔöÇ */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-content">
            {/* Suporta m├║ltiplos pastores (array) ou pastor ├║nico (legado) */}
            <PastorCarousel pastors={data.pastors || (data.pastor ? [data.pastor] : [])} />
            <div className="welcome-text">
              <h2>{data.welcome.title}</h2>
              <p>{data.welcome.text1}</p>
              <p>{data.welcome.text2}</p>
              <Link to={data.welcome.buttonLink || "/contato"} className="welcome-btn">
                <Phone size={18} /> {data.welcome.buttonText || "Entre em Contato"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇ Se├º├úo do Podcast Spotify ÔöÇÔöÇ */}
      <section className="spotify-section">
        <div className="container">
          <h2>Ou├ºa Nossas Mensagens</h2>
          <p className="section-subtitle">
            Podcast com as prega├º├Áes e estudos b├¡blicos da ADMAC
          </p>
          <div className="spotify-wrapper">
            {/* URL do Spotify configur├ível via painel admin */}
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

      {/* ÔöÇÔöÇ V├¡deos Recentes do YouTube ÔöÇÔöÇ */}
      <RecentVideos limit={4} />

      {/* ÔöÇÔöÇ Programa├º├úo Semanal ÔöÇÔöÇ */}
      <section className="schedule-home-section">
        <div className="container">
          <div className="section-header">
            <Calendar size={32} />
            <h2>Programa├º├úo Semanal</h2>
          </div>
          <p className="section-subtitle">
            Participe dos nossos cultos e atividades
          </p>

          <div className="schedule-home-grid">
            {data.schedule.map((item, index) => {
              // Usa o ├¡cone da programa├º├úo ou fallback para o ├¡cone Book
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

          {/* Endere├ºo fixo da igreja */}
          <div className="location-info">
            <MapPin size={20} />
            <span>QN 516 - Samambaia, Bras├¡lia - DF</span>
          </div>
        </div>
      </section>

      {/* ÔöÇÔöÇ Se├º├úo de Minist├®rios ÔöÇÔöÇ */}
      <section className="ministries-home-section">
        <div className="container">
          <h2>Nossos Minist├®rios</h2>
          <p className="section-subtitle">
            Conhe├ºa as ├íreas de atua├º├úo da nossa igreja
          </p>

          <div className="ministries-home-grid">
            {/* Minist├®rios configur├íveis pelo painel admin */}
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

      {/* ÔöÇÔöÇ Se├º├úo de Aniversariantes ÔÇö sempre vis├¡vel ÔöÇÔöÇ */}
      <section className="birthdays-home-section" style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, var(--primary-dark, #0d0d1a) 0%, var(--surface-color, #1a1a2e) 100%)'
      }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '0.5rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>­ƒÄé</span>
            <h2 style={{ margin: '0 0.5rem', fontSize: '2rem', fontWeight: 700 }}>Aniversariantes dos Minist├®rios</h2>
          </div>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Vamos celebrar com quem faz parte da nossa fam├¡lia!
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
                {/* Avatar: usa foto cadastrada ou avatar autom├ítico gerado por nome */}
                <img
                  src={transformImageLink(person.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'A')}&background=d4af37&color=000&bold=true&size=150`}
                  alt={person.name}
                  style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #d4af37', boxShadow: '0 0 0 4px rgba(212,175,55,0.2)' }}
                />
                {/* Nome do aniversariante */}
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.2, marginTop: '0.4rem' }}>
                  {person.name || 'ÔÇö'}
                </div>
                {/* Data de anivers├írio (formato DD/MM) */}
                {person.date && (
                  <div style={{ fontSize: '0.88rem', color: '#d4af37', fontWeight: 700, background: 'rgba(212,175,55,0.12)', padding: '0.2rem 0.7rem', borderRadius: '20px' }}>
                    ­ƒÄé {person.date}
                  </div>
                )}
                {/* Nome do minist├®rio de origem */}
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>
                  {person.ministryLabel}
                </div>
              </div>
            ))}
          </div>

          {/* Mensagem de placeholder quando n├úo h├í aniversariantes cadastrados */}
          {allBirthdays.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontStyle: 'italic' }}>
              ­ƒÄé Nenhum aniversariante cadastrado ainda. Adicione pelo Painel ÔåÆ Configura├º├Áes ÔåÆ Editar Minist├®rio ÔåÆ Aniversariantes.
            </div>
          )}
        </div>
      </section>

      {/* ÔöÇÔöÇ Atividades em Destaque ÔöÇÔöÇ */}
      <section className="activities-home-section" style={{ padding: '4rem 0', background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '.5rem' }}>Atividades em Destaque</h2>
          <p className="section-subtitle">Veja o que est├í acontecendo na igreja</p>
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

      {/* ÔöÇÔöÇ Se├º├úo CTA (Call to Action) ÔöÇÔöÇ */}
      <section className="cta-home-section">
        <div className="container">
          <h2>{data.cta?.title || 'Fa├ºa Parte da Nossa Fam├¡lia'}</h2>
          <p>
            {data.cta?.subtitle || 'Venha nos visitar e experimente o amor de Deus em nossa comunidade'}
          </p>
          <div className="cta-home-buttons">
            {/* Bot├úo prim├írio: link configur├ível (padr├úo: /contato) */}
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
