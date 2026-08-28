import React, { useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Users,
    Image as ImageIcon,
    Calendar,
    MessageSquare,
    Gift,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    ExternalLink,
    Video,
    Camera,
    Newspaper,
    Instagram,
    Youtube,
    Facebook,
    Mail,
    ArrowRight,
    X
} from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import { useAutomation } from '../hooks/useAutomation';
import { getDriveDisplayUrl } from '../lib/automation';
import { transformImageLink } from '../utils/imageUtils';
import '../css/Midia.css';
// ---------------------------------------------------------------------------------
// Midia.jsx - Página de Mídia Profissional do ADMAC
// Esta página utiliza lazy data via useMinistryData e framer-motion para animações.
// ---------------------------------------------------------------------------------

// Função auxiliar para extrair o thumbnail do YouTube de forma robusta
const getYoutubeThumbnail = (urlOrId) => {
    if (!urlOrId) return null;
    // Se for apenas o ID (ex: 11 caracteres sem '/')
    if (urlOrId.length === 11 && !urlOrId.includes('/')) {
        return `https://img.youtube.com/vi/${urlOrId}/hqdefault.jpg`;
    }

    const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*u\/\w\/|embed\/|watch\?v=)|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
    const match = urlOrId.match(regex);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const Midia = () => {
    // Carrega os dados específicos do ministério de mídia do banco de dados/localStorage
    const [data] = useMinistryData('midia');

    // Automação de conteúdo (YouTube + Google Drive)
    const { config, videos: autoVideos, images: driveImages, driveVideos, texts } = useAutomation();

    // Estado para controlar a foto atual da galeria (carrossel)
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Estado para o Lightbox (modal de imagem cheia)
    const [selectedImage, setSelectedImage] = useState(null);

    // Default data structure consistent with initialData.js
    const {
        hero = {
            title: "Portal de Mídia",
            subtitle: "Excelência técnica e criatividade a serviço do Reino de Deus",
            image: "/midia.jpg",
            cta: "Ver Programação"
        },
        live = {
            title: "Culto Online - Assista Agora",
            url: "https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxx",
            description: "Acompanhe nossas transmissões ao vivo todos os domingos às 18h."
        },
        team = [],
        gallery = [],
        backstage = [],
        birthdays = {
            title: "Aniversariantes do Mês",
            text: "Celebrando a vida daqueles que tornam nossa missão possível!",
            people: []
        },
        schedule = [],
        videos = [],
        news = [],
        footer = {
            text: "ADMAC Mídia - Comunicando a Verdade com Excelência",
            social: { instagram: "@admacoficial", youtube: "ADMAC TV", facebook: "ADMAC" }
        }
    } = data || {};

    // Galeria combinada: manuais + imagens automáticas do Drive
    const allGallery = useMemo(() => {
        if (config.enabled && driveImages && driveImages.length > 0) {
            return [...(gallery || []), ...driveImages.map(img => ({ url: getDriveDisplayUrl(img.id, img.mimeType), caption: img.name }))];
        }
        return gallery || [];
    }, [config.enabled, gallery, driveImages]);

    // Vídeos combinados: automáticos (YouTube) + Drive + manuais
    const allVideos = useMemo(() => {
        if (!config.enabled) return videos || [];
        const auto = (autoVideos || []).map(v => ({
            id: v.id,
            title: v.title,
            url: v.url,
            thumbnail: v.thumbnail,
            date: v.date ? new Date(v.date).toLocaleDateString('pt-BR') : '',
            views: ''
        }));
        const drive = (driveVideos || []).map(f => ({
            id: f.id,
            title: f.name,
            url: getDriveDisplayUrl(f.id, f.mimeType),
            thumbnail: 'https://via.placeholder.com/640x360?text=Video',
            date: f.modifiedDate ? new Date(f.modifiedDate).toLocaleDateString('pt-BR') : '',
            views: ''
        }));
        return [...auto, ...drive, ...(videos || [])].slice(0, 4);
    }, [config.enabled, autoVideos, driveVideos, videos]);

    // Funções de navegação do carrossel da Galeria
    const nextPhoto = () => {
        if (!allGallery || allGallery.length === 0) return;
        setGalleryIndex(prev => (prev + 1) % allGallery.length);
    };
    const prevPhoto = () => {
        if (!allGallery || allGallery.length === 0) return;
        setGalleryIndex(prev => (prev - 1 + allGallery.length) % allGallery.length);
    };

    // Mantém o índice válido quando a galeria muda de tamanho
    const safeIndex = allGallery.length > 0 ? Math.min(galleryIndex, allGallery.length - 1) : 0;

    // Configurações padrão de animação para as seções (efeito de "subir" ao rolar a página)
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 }
    };

    return (
        <div className="midia-page">

            {/* --- 1. HERO SECTION --- */}
            <section className="midia-hero" style={{ backgroundImage: `url(${transformImageLink(hero.image)})` }}>
                <motion.div className="hero-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                    <span className="hero-badge">Inovação • Comunicação • Reino</span>
                    <h1 className="hero-title">{hero.title}</h1>
                    <p className="hero-subtitle">{hero.subtitle}</p>
                    <div className="hero-actions">
                        <a href="#agenda" className="btn-primary">{hero.cta}</a>
                        <a href="#equipe" className="btn-secondary">Conheça a Equipe</a>
                    </div>
                </motion.div>
            </section>

            <section id="video" className="midia-live">
                <div className="container">
                    <div className="section-header">
                        <Video className="section-icon" />
                        <h2>Vídeos e Transmissões</h2>
                        <p>{live.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        <motion.div className="live-card" {...fadeIn}>
                            <div className="live-header">
                                <div className="live-status">
                                    <span className="dot"></span>
                                    AO VIVO • YOUTUBE
                                </div>
                                <h3>{live.title}</h3>
                            </div>
                            <div className="video-container">
                                <iframe
                                    src={live.url}
                                    title={live.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </motion.div>

                        {allVideos && allVideos.length > 0 && (
                            <div className="video-gallery-grid">
                                {allVideos.map((vid, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="video-thumb-card"
                                        {...fadeIn}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => window.open(vid.url.replace('embed/', 'watch?v='), '_blank')}
                                    >
                                        <div className="video-thumb-media">
                                            <img
                                                src={transformImageLink(vid.thumbnail) || getYoutubeThumbnail(vid.url) || 'https://via.placeholder.com/640x360?text=ADMAC+Video'}
                                                alt={vid.title}
                                                onError={(e) => {
                                                    const ytThumb = getYoutubeThumbnail(vid.url);
                                                    if (ytThumb && e.target.src !== ytThumb) {
                                                        e.target.src = ytThumb;
                                                    } else if (e.target.src !== 'https://via.placeholder.com/640x360?text=Video') {
                                                        e.target.src = 'https://via.placeholder.com/640x360?text=Video';
                                                    }
                                                }}
                                            />
                                            <div className="video-thumb-play">
                                                <Play fill="white" size={40} />
                                            </div>
                                        </div>
                                        <div className="video-thumb-body">
                                            <h4>{vid.title}</h4>
                                            <div className="video-thumb-meta">
                                                <span>{vid.date}</span>
                                                <span>{vid.views} visualizações</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {allVideos && allVideos.length > 0 && (
                            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <a
                                    href={config.youtubeChannel || 'https://www.youtube.com/@ADMACSEDEOFICIAL316'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    <Youtube size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Ver todos no YouTube
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- 4. BASTIDORES (BACKSTAGE) --- */}
            <section id="bastidores" className="midia-backstage">
                <div className="container">
                    <div className="section-header">
                        <Camera className="section-icon" />
                        <h2>Por Trás das Câmeras</h2>
                        <p>O que acontece nos bastidores para levar a Palavra de Deus até você.</p>
                    </div>
                    {backstage && backstage.map((item, idx) => (
                        <div key={idx} className={`backstage-item ${item.layout === 'right' ? 'reverse' : ''}`}>
                            <motion.div 
                                className="backstage-image" 
                                {...fadeIn}
                                onClick={() => setSelectedImage({ url: item.image, caption: item.title })}
                            >
                                <img src={transformImageLink(item.image)} alt={item.title} />
                            </motion.div>
                            <motion.div className="backstage-content" {...fadeIn} transition={{ delay: 0.3 }}>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                                <div style={{ marginTop: '2rem' }}>
                                    <a href="#galeria" className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem' }}>Ver Mais Fotos</a>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 5. BIRTHDAYS --- */}
            <section className="midia-birthdays">
                <div className="container">
                    <div className="section-header">
                        <Gift className="section-icon" />
                        <h2>Aniversariantes do Mês</h2>
                        <p>{birthdays.text}</p>
                    </div>
                    <div className="birthday-grid">
                        {birthdays.people && birthdays.people.map((person, idx) => (
                            <motion.div key={idx} className={`birthday-card ${person.isToday ? 'is-today' : ''}`} {...fadeIn}>
                                {person.isToday && <span className="today-label">Aniversariante do Dia!</span>}
                                <div className="person-photo">
                                    <img src={transformImageLink(person.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} alt={person.name} />
                                </div>
                                <h4>{person.name}</h4>
                                <span className="birthday-date">{person.date}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 6. GALLERY --- */}
            <section id="galeria" className="midia-gallery">
                <div className="container">
                    <div className="section-header">
                        <ImageIcon className="section-icon" />
                        <h2>Galeria de Fotos</h2>
                        <p>Momentos inesquecíveis da nossa jornada.</p>
                    </div>

                    <div className="gallery-main">
                        <AnimatePresence mode="wait">
                            {allGallery && allGallery.length > 0 && allGallery[safeIndex] && (
                                <motion.div
                                    key={safeIndex}
                                    className="gallery-slide"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <img 
                                        src={transformImageLink(allGallery[safeIndex].url)} 
                                        alt={allGallery[safeIndex].caption} 
                                        onClick={() => setSelectedImage(allGallery[safeIndex])}
                                    />
                                    <div className="gallery-info">
                                        <p>{allGallery[safeIndex].caption}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {allGallery && allGallery.length > 1 && (
                            <>
                                <button className="carousel-btn prev" onClick={prevPhoto}><ChevronLeft /></button>
                                <button className="carousel-btn next" onClick={nextPhoto}><ChevronRight /></button>
                            </>
                        )}
                    </div>

                    <div className="thumb-grid">
                        {allGallery && allGallery.map((thumb, idx) => (
                            <div
                                key={idx}
                                className={`thumb-item ${idx === safeIndex ? 'active' : ''}`}
                                onClick={() => setGalleryIndex(idx)}
                            >
                                <img src={transformImageLink(thumb.url)} alt={`Minis ${idx}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 6.5 DOCUMENTOS (AUTOMAÇÃO) --- */}
            {config.enabled && texts && texts.length > 0 && (
                <section id="documentos" className="midia-docs">
                    <div className="container">
                        <div className="section-header">
                            <Newspaper className="section-icon" />
                            <h2>Documentos</h2>
                            <p>Materiais e documentos disponíveis para download.</p>
                        </div>
                        <div className="docs-list">
                            {texts.map((doc, idx) => (
                                <a
                                    key={idx}
                                    href={getDriveDisplayUrl(doc.id, doc.mimeType)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="doc-item"
                                >
                                    <span>{doc.name}</span>
                                    <ExternalLink size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- 7. TEAM --- */}
            <section id="equipe" className="midia-team">
                <div className="container">
                    <div className="section-header">
                        <Users className="section-icon" />
                        <h2>Nossa Equipe</h2>
                        <p>Pessoas dedicadas que fazem a engrenagem girar.</p>
                    </div>
                    <div className="team-grid">
                        {team && team.map((member, idx) => (
                            <motion.div key={idx} className="team-card" {...fadeIn} transition={{ delay: idx * 0.1 }}>
                                <img src={transformImageLink(member.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} />
                                <div className="team-overlay">
                                    <h3>{member.name}</h3>
                                    <span>{member.role}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 8. SCHEDULE --- */}
            <section id="agenda" className="midia-schedule">
                <div className="container">
                    <div className="section-header">
                        <Calendar className="section-icon" />
                        <h2>Agenda de Programação</h2>
                        <p>Fique por dentro dos nossos horários e eventos especiais.</p>
                    </div>
                    <div className="schedule-container">
                        {schedule && schedule.map((item, idx) => (
                            <motion.div key={idx} className={`schedule-card ${item.isNext ? 'highlight' : ''}`} {...fadeIn}>
                                <div className="schedule-date-box">
                                    <span className="day">{item.day}</span>
                                    <span className="time">{item.time}</span>
                                </div>
                                <div className="schedule-info">
                                    <h4>{item.activity}</h4>
                                    <p><MapPin size={16} /> {item.location}</p>
                                </div>
                                {item.isNext && <span className="next-label">Próximo Evento</span>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 9. NEWS (EXTRAS) --- */}
            <section className="midia-news">
                <div className="container">
                    <div className="section-header">
                        <Newspaper className="section-icon" />
                        <h2>Últimas Novidades</h2>
                        <p>Fique informado sobre os avanços do nosso ministério.</p>
                    </div>
                    <div className="news-grid">
                        {news && news.map((item, idx) => (
                            <motion.div key={idx} className="news-card" {...fadeIn} transition={{ delay: idx * 0.1 }}>
                                <img src={transformImageLink(item.image)} alt={item.title} className="news-img" />
                                <div className="news-body">
                                    <span className="news-date">{item.date}</span>
                                    <h4>{item.title}</h4>
                                    <p>{item.summary}</p>
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <a href="#" style={{ color: 'var(--midia-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>Ler Mais <ArrowRight size={16} /></a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 10. FOOTER DA PÁGINA (Rodapé Interno) --- */}
            <footer className="midia-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <h3>MÍDIA<span>ADMAC</span></h3>
                            <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.4)' }}>Excelência para o Reino.</p>
                        </div>
                        {/* Links das redes sociais configurados via Painel Admin */}
                        <div className="social-links">
                            <a href="#" className="social-link"><Instagram /> {footer?.social?.instagram || '@admacoficial'}</a>
                            <a href="#" className="social-link"><Youtube /> {footer?.social?.youtube || 'ADMAC TV'}</a>
                            <a href="#" className="social-link"><Facebook /> {footer?.social?.facebook || 'ADMAC'}</a>
                        </div>
                        <div className="footer-contact">
                            <a href="mailto:contato@admac.com" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={18} /> Contato</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 ADMAC - Departamento de Mídia. Todos os direitos reservados.</p>
                        <p>Design & Tecnologia</p>
                    </div>
                </div>
            </footer>

            {/* --- LIGHTBOX MODAL --- */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div 
                            className="lightbox-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                                <X size={24} />
                            </button>
                            <img src={transformImageLink(selectedImage.url || selectedImage.image)} alt={selectedImage.caption} />
                            {selectedImage.caption && (
                                <div className="lightbox-caption">
                                    {selectedImage.caption}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Midia;
