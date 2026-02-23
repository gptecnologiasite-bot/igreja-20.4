import React, { useState } from 'react';
import { BookOpen, PenTool, Sun, Calendar, Heart, Star, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Revista.css';

// Componentes de Página
const PageCover = ({ page }) => (
  <div className="page-cover" style={{ backgroundImage: `url(${page.image})` }}>
    <div className="cover-content">
      <span className="cover-badge">{page.edition}</span>
      <h1 className="cover-title">{page.title}</h1>
      <p className="cover-subtitle">{page.subtitle}</p>
    </div>
  </div>
);

const PageIndex = ({ page, onNavigate }) => {
  const iconMap = {
    BookOpen: BookOpen,
    PenTool: PenTool,
    Sun: Sun,
    Calendar: Calendar,
    Heart: Heart,
    Star: Star,
    Users: Users
  };

  return (
    <div className="page-index" style={{ padding: '3rem' }}>
      <h2 className="index-title">{page.title}</h2>
      <div className="index-list">
        {page.items.map((item, idx) => {
          const Icon = iconMap[item.icon] || BookOpen;
          return (
            <div key={idx} className="index-item" onClick={() => onNavigate(item.page - 1)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <Icon size={24} color="var(--primary-color)" />
                </div>
                <span className="index-label">{item.label}</span>
              </div>
              <span className="index-page-num">pág. {item.page}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PageArticle = ({ page }) => (
  <div className="page-container">
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>
    {page.image && <img src={page.image} alt={page.title} className="article-image" />}
    <div className="article-body">
      {page.body.split('\n').map((paragraph, idx) => (
        <p key={idx}>
          {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
          {idx === 0 ? paragraph.slice(1) : paragraph}
        </p>
      ))}
    </div>
  </div>
);

const PageColumnist = ({ page }) => (
  <div className="page-container">
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    <div className="layout-sidebar">
      <div className="author-sidebar">
        <img src={page.author.image} alt={page.author.name} className="author-image" />
        <div className="author-name">{page.author.name}</div>
        <div className="author-role">{page.author.role}</div>
        <p className="author-bio">{page.author.bio}</p>
      </div>

      <div className="article-body" style={{ columns: 1 }}>
        {page.body.split('\n').map((paragraph, idx) => {
          if (paragraph.includes('<quote>')) {
            const content = paragraph.replace('<quote>', '').replace('</quote>', '');
            return <div key={idx} className="quote-box">{content}</div>;
          }
          return (
            <p key={idx}>
              {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
              {idx === 0 ? paragraph.slice(1) : paragraph}
            </p>
          );
        })}
      </div>
    </div>
  </div>
);

const PageDevotional = ({ page }) => (
  <div className="page-container">
    <div className="article-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    <div className="layout-3col">
      {page.items.map((item, idx) => (
        <div key={idx} className="devotional-card">
          <div className="devotional-date">{item.date}</div>
          <h3 className="devotional-title">{item.title}</h3>
          <p className="devotional-text">{item.text}</p>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
            <Heart size={16} color="var(--primary-color)" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PageFeature = ({ page }) => (
  <div className="page-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem', alignItems: 'center', height: '100%' }}>
      {/* Left Column: Title & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
        <span className="article-category" style={{ marginBottom: '1rem', display: 'block' }}>{page.category}</span>
        <h2 className="article-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 0.9 }}>
          {page.title}
        </h2>
        {page.highlight && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--primary-color)', color: '#000', borderRadius: '12px', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderLeft: '4px solid #fff' }}>
            {page.highlight}
          </div>
        )}
      </div>

      {/* Right Column: Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '100%', paddingRight: '0.5rem' }}>
        {page.events.map((event, idx) => (
          <div key={idx} className="revista-event-card">
            <div className="revista-event-date-box">
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold' }}>DEZ</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{event.date.split('/')[0]}</div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                {event.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                <Calendar size={14} />
                <span>{event.date}</span>
                <span>•</span>
                <span style={{ color: 'var(--primary-color)' }}>{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MotionDiv = motion.div;

export default function RevistaAdmac() {
  const [data] = useMinistryData('revista');
  const [currentPage, setCurrentPage] = useState(0);

  const magazineData = data?.pages || [];
  const totalPages = magazineData.length;

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  const goToPage = (index) => setCurrentPage(index);

  if (!magazineData.length) return null;

  return (
    <div className="revista-container">
      <div className="revista-wrapper">
        {/* Header da Revista */}
        <header className="revista-header">
          <div className="revista-brand">
            <div className="revista-logo">AD</div>
            <div className="revista-info">
              <h1>{data.hero?.title || 'ADMAC NEWS'}</h1>
              <p>{data.hero?.subtitle || 'Revista Digital'}</p>
            </div>
          </div>

          <div className="revista-controls">
            <button onClick={prevPage} className="btn-nav" title="Anterior">
              <ArrowLeft size={18} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button onClick={nextPage} className="btn-nav" title="Próxima">
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* Conteúdo da Página com Animação */}
        <div className="revista-content">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ height: '100%' }}
            >
              {magazineData[currentPage].type === "cover" && <PageCover page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "index" && <PageIndex page={magazineData[currentPage]} onNavigate={goToPage} />}
              {magazineData[currentPage].type === "article" && <PageArticle page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "columnist" && <PageColumnist page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "devotional" && <PageDevotional page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "feature" && <PageFeature page={magazineData[currentPage]} />}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Footer da Revista */}
        <footer className="revista-footer">
          <div>Igreja ADMAC • Vivendo o Sobrenatural</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
