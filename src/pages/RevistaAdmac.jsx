import React, { useState } from 'react';
import { BookOpen, PenTool, Sun, Calendar, Heart, Star, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMinistryData } from '../hooks/useMinistryData';

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
    <div className="page-index p-12">
      <h2 className="index-title">{page.title}</h2>
      <div className="index-list">
        {page.items.map((item, idx) => {
          const Icon = iconMap[item.icon] || BookOpen;
          return (
            <div key={idx} className="index-item" onClick={() => onNavigate(item.page - 1)}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg text-primary">
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
    <div className="article-header text-center mb-12">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    <div className="layout-3col">
      {page.items.map((item, idx) => (
        <div key={idx} className="devotional-card">
          <div className="devotional-date">{item.date}</div>
          <h3 className="devotional-title">{item.title}</h3>
          <p className="devotional-text">{item.text}</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
            <Heart size={16} className="text-primary" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PageFeature = ({ page }) => (
  <div className="page-container h-full flex flex-col justify-center">
    <div className="grid md:grid-cols-2 gap-12 items-center h-full">
      {/* Left Column: Title & Header */}
      <div className="flex flex-col justify-center text-left">
        <span className="article-category mb-4 block">{page.category}</span>
        <h2 className="article-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 0.9 }}>
          {page.title}
        </h2>
        {page.highlight && (
          <div className="mt-8 p-6 bg-[var(--primary-color)] text-black rounded-xl font-semibold text-lg shadow-lg border-l-4 border-white">
            {page.highlight}
          </div>
        )}
      </div>

      {/* Right Column: Events List */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-full pr-2 custom-scrollbar">
        {page.events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[var(--primary-color)] transition-all group">
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 border border-white/10 rounded-lg min-w-[70px] group-hover:border-[var(--primary-color)] transition-colors">
              <div className="text-xs uppercase text-[var(--primary-color)] font-bold">DEZ</div>
              <div className="text-2xl font-bold text-white">{event.date.split('/')[0]}</div>
            </div>

            <div className="flex-1">
              <div className="text-lg font-semibold text-white group-hover:text-[var(--primary-color)] transition-colors">
                {event.title}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                <Calendar size={14} />
                <span>{event.date}</span>
                <span className="mx-1">•</span>
                <span className="text-[var(--primary-color)]">{event.time}</span>
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
            <span className="flex items-center px-4 font-mono text-sm text-white/50">
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
