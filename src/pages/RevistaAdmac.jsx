/**
 * RevistaAdmac.jsx
 * 
 * Página da Revista Digital da ADMAC.
 * Simula uma revista interativa com múltiplos tipos de página:
 * capa, índice, artigos, colunistas, devocionais e destaques.
 * 
 * Usa Framer Motion para animações de transição entre páginas
 * e carrega os dados dinâmicos via hook useMinistryData.
 */

import React, { useState } from 'react';

// Ícones utilizados nas páginas da revista
import { BookOpen, PenTool, Sun, Calendar, Heart, Star, Users, ArrowLeft, ArrowRight } from 'lucide-react';

// Framer Motion para animações de transição entre páginas
import { motion, AnimatePresence } from 'framer-motion';

// Hook personalizado para buscar dados do ministério (revista) via DatabaseService
import { useMinistryData } from '../hooks/useMinistryData';

// Estilos específicos da página da revista
import '../css/Revista.css';


// ============================================================
// COMPONENTES DE PÁGINA - Cada tipo de conteúdo da revista
// ============================================================

/**
 * PageCover - Componente da Capa da Revista
 * Exibe a imagem de fundo, edição, título e subtítulo.
 * É a primeira página exibida ao abrir a revista.
 * 
 * @param {Object} page - Dados da página (image, edition, title, subtitle)
 */
const PageCover = ({ page }) => (
  <div className="page-cover" style={{ backgroundImage: `url(${page.image})` }}>
    <div className="cover-content">
      {/* Badge com o número da edição (ex: "Edição Nº 42 • Dezembro 2025") */}
      <span className="cover-badge">{page.edition}</span>

      {/* Título principal da capa */}
      <h1 className="cover-title">{page.title}</h1>

      {/* Subtítulo/descrição da edição */}
      <p className="cover-subtitle">{page.subtitle}</p>
    </div>
  </div>
);


/**
 * PageIndex - Componente do Índice da Revista
 * Lista os itens/seções da revista com ícones e números de página.
 * Cada item é clicável e navega diretamente para a página correspondente.
 * 
 * @param {Object} page - Dados da página (title, items[])
 * @param {Function} onNavigate - Função para navegar para uma página específica
 */
const PageIndex = ({ page, onNavigate }) => {
  // Mapeamento de nomes de ícones (string) para componentes de ícone
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
      {/* Título do índice */}
      <h2 className="index-title">{page.title}</h2>

      {/* Lista de itens do índice em grid */}
      <div className="index-list">
        {page.items.map((item, idx) => {
          // Busca o ícone pelo nome; usa BookOpen como fallback
          const Icon = iconMap[item.icon] || BookOpen;
          return (
            // Cada item navega para a página correspondente ao ser clicado
            <div key={idx} className="index-item" onClick={() => onNavigate(item.page - 1)}>
              {/* Ícone e label do item */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <Icon size={24} color="var(--primary-color)" />
                </div>
                <span className="index-label">{item.label}</span>
              </div>

              {/* Número da página */}
              <span className="index-page-num">pág. {item.page}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


/**
 * PageArticle - Componente de Artigo da Revista
 * Exibe artigos com categoria, título, imagem e corpo de texto.
 * O primeiro caractere do texto é formatado como "drop cap" (letra capitular).
 * 
 * @param {Object} page - Dados da página (category, title, image, body)
 */
const PageArticle = ({ page }) => (
  <div className="page-container">
    {/* Cabeçalho do artigo: categoria e título */}
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    {/* Imagem do artigo (renderizada somente se existir) */}
    {page.image && <img src={page.image} alt={page.title} className="article-image" />}

    {/* Corpo do artigo dividido em parágrafos */}
    <div className="article-body">
      {page.body.split('\n').map((paragraph, idx) => (
        <p key={idx}>
          {/* Primeiro parágrafo recebe a letra capitular (drop cap) */}
          {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
          {idx === 0 ? paragraph.slice(1) : paragraph}
        </p>
      ))}
    </div>
  </div>
);


/**
 * PageColumnist - Componente de Colunista da Revista
 * Layout com sidebar exibindo foto e info do autor à esquerda,
 * e o texto do artigo à direita. Suporta citações com <quote>.
 * 
 * @param {Object} page - Dados da página (category, title, author{}, body)
 */
const PageColumnist = ({ page }) => (
  <div className="page-container">
    {/* Cabeçalho: categoria e título do artigo */}
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    {/* Layout com sidebar do autor + conteúdo do artigo */}
    <div className="layout-sidebar">
      {/* Sidebar do autor: foto, nome, cargo e biografia */}
      <div className="author-sidebar">
        <img src={page.author.image} alt={page.author.name} className="author-image" />
        <div className="author-name">{page.author.name}</div>
        <div className="author-role">{page.author.role}</div>
        <p className="author-bio">{page.author.bio}</p>
      </div>

      {/* Corpo do artigo do colunista (coluna única) */}
      <div className="article-body" style={{ columns: 1 }}>
        {page.body.split('\n').map((paragraph, idx) => {
          // Verifica se o parágrafo é uma citação (<quote>...</quote>)
          if (paragraph.includes('<quote>')) {
            const content = paragraph.replace('<quote>', '').replace('</quote>', '');
            return <div key={idx} className="quote-box">{content}</div>;
          }
          return (
            <p key={idx}>
              {/* Drop cap no primeiro parágrafo */}
              {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
              {idx === 0 ? paragraph.slice(1) : paragraph}
            </p>
          );
        })}
      </div>
    </div>
  </div>
);


/**
 * PageDevotional - Componente de Devocional Diário
 * Exibe cards com devocionais organizados em grid de 3 colunas.
 * Cada card mostra a data, título, texto e um ícone de coração.
 * 
 * @param {Object} page - Dados da página (category, title, items[])
 */
const PageDevotional = ({ page }) => (
  <div className="page-container">
    {/* Cabeçalho centralizado do devocional */}
    <div className="article-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>

    {/* Grid de 3 colunas com os cards devocionais */}
    <div className="layout-3col">
      {page.items.map((item, idx) => (
        <div key={idx} className="devotional-card">
          {/* Data do devocional (ex: "01 DEZ") */}
          <div className="devotional-date">{item.date}</div>

          {/* Título do devocional */}
          <h3 className="devotional-title">{item.title}</h3>

          {/* Texto/reflexão do devocional */}
          <p className="devotional-text">{item.text}</p>

          {/* Separador com ícone de coração */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
            <Heart size={16} color="var(--primary-color)" />
          </div>
        </div>
      ))}
    </div>
  </div>
);


/**
 * PageFeature - Componente de Destaque/Agenda
 * Layout em duas colunas: título e destaque à esquerda,
 * lista de eventos com datas à direita.
 * 
 * @param {Object} page - Dados da página (category, title, highlight, events[])
 */
const PageFeature = ({ page }) => (
  <div className="page-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    {/* Grid de 2 colunas: info + eventos */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem', alignItems: 'center', height: '100%' }}>

      {/* Coluna esquerda: Título e destaque */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
        {/* Categoria do destaque */}
        <span className="article-category" style={{ marginBottom: '1rem', display: 'block' }}>{page.category}</span>

        {/* Título principal com tamanho responsivo */}
        <h2 className="article-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 0.9 }}>
          {page.title}
        </h2>

        {/* Box de destaque (exibido somente se houver "highlight") */}
        {page.highlight && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--primary-color)', color: '#000', borderRadius: '12px', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderLeft: '4px solid #fff' }}>
            {page.highlight}
          </div>
        )}
      </div>

      {/* Coluna direita: Lista de eventos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '100%', paddingRight: '0.5rem' }}>
        {page.events.map((event, idx) => (
          <div key={idx} className="revista-event-card">
            {/* Box com o dia do evento */}
            <div className="revista-event-date-box">
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold' }}>DEZ</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{event.date.split('/')[0]}</div>
            </div>

            {/* Detalhes do evento: título, data e horário */}
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


// Wrapper do Framer Motion para animações de transição
const MotionDiv = motion.div;


// ============================================================
// COMPONENTE PRINCIPAL - RevistaAdmac
// ============================================================

/**
 * RevistaAdmac - Componente principal da Revista Digital
 * 
 * Gerencia a navegação entre as páginas da revista,
 * renderiza o header com controles, o conteúdo animado
 * e o footer com barra de progresso.
 */
export default function RevistaAdmac() {
  // Busca os dados da revista via hook (carrega do DatabaseService/localStorage)
  const [data] = useMinistryData('revista');

  // Estado que controla qual página está sendo exibida (índice 0-based)
  const [currentPage, setCurrentPage] = useState(0);

  // Array de páginas da revista e total
  const magazineData = data?.pages || [];
  const totalPages = magazineData.length;

  // Funções de navegação entre páginas (circular: última -> primeira e vice-versa)
  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  const goToPage = (index) => setCurrentPage(index);

  // Se não houver dados de páginas, não renderiza nada
  if (!magazineData.length) return null;

  return (
    <div className="revista-container">
      <div className="revista-wrapper">

        {/* ==================== HEADER DA REVISTA ==================== */}
        {/* Barra superior com logo, título e botões de navegação */}
        <header className="revista-header">
          {/* Logo e informações da revista */}
          <div className="revista-brand">
            <div className="revista-logo">AD</div>
            <div className="revista-info">
              <h1>{data.hero?.title || 'ADMAC NEWS'}</h1>
              <p>{data.hero?.subtitle || 'Revista Digital'}</p>
            </div>
          </div>

          {/* Controles de navegação: anterior, indicador de página, próximo */}
          <div className="revista-controls">
            <button onClick={prevPage} className="btn-nav" title="Anterior">
              <ArrowLeft size={18} />
            </button>

            {/* Indicador de página atual (ex: "3 / 9") */}
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
              {currentPage + 1} / {totalPages}
            </span>

            <button onClick={nextPage} className="btn-nav" title="Próxima">
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* ==================== CONTEÚDO DA PÁGINA ==================== */}
        {/* Área principal que exibe a página atual com animação de transição */}
        <div className="revista-content">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}     // Entra da direita com fade
              animate={{ opacity: 1, x: 0 }}      // Posição final visível
              exit={{ opacity: 0, x: -20 }}        // Sai pela esquerda com fade
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ height: '100%' }}
            >
              {/* Renderiza o componente correto baseado no tipo de página */}
              {magazineData[currentPage].type === "cover" && <PageCover page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "index" && <PageIndex page={magazineData[currentPage]} onNavigate={goToPage} />}
              {magazineData[currentPage].type === "article" && <PageArticle page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "columnist" && <PageColumnist page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "devotional" && <PageDevotional page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "feature" && <PageFeature page={magazineData[currentPage]} />}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* ==================== FOOTER DA REVISTA ==================== */}
        {/* Rodapé com nome da igreja e barra de progresso */}
        <footer className="revista-footer">
          <div>Igreja ADMAC • Vivendo o Sobrenatural</div>

          {/* Barra de progresso que mostra visualmente a posição na revista */}
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
