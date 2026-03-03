import React, { useState, useEffect } from 'react';
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
    ArrowRight
} from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Midia.css';
// ---------------------------------------------------------------------------------
// Midia.jsx - Página de Mídia Profissional do ADMAC
// Esta página utiliza lazy data via useMinistryData e framer-motion para animações.
// ---------------------------------------------------------------------------------
const Midia = () => {
    // Carrega os dados específicos do ministério de mídia do banco de dados/localStorage
    const [data] = useMinistryData('midia');

    // Estado para controlar a foto atual da galeria (carrossel)
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Default data structure consistent with initialData.js
    const {
        hero = {
            title: "Portal de Mídia",
            subtitle: "Excelência técnica e criatividade a serviço do Reino de Deus",
            bgImage: "/midia.jpg",
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
        testimonials = [],
        schedule = [],
        news = [],
        footer = {
            text: "ADMAC Mídia - Comunicando a Verdade com Excelência",
            social: { instagram: "@admacoficial", youtube: "ADMAC TV", facebook: "ADMAC" }
        }
    } = data || {};

    // Funções de navegação do carrossel da Galeria
    const nextPhoto = () => {
        if (!gallery || gallery.length === 0) return;
        setGalleryIndex(prev => (prev + 1) % gallery.length);
    };
    const prevPhoto = () => {
        if (!gallery || gallery.length === 0) return;
        setGalleryIndex(prev => (prev - 1 + gallery.length) % gallery.length);
    };

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
            <section className="midia-hero" style={{ backgroundImage: `url(${hero.bgImage})` }}>
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

            {/* --- 2. FEATURED VIDEO --- */}
            <section id="video" className="midia-live">
                <div className="container">
                    <div className="section-header">
                        <Video className="section-icon" />
                        <h2>Vídeo em Destaque</h2>
                        <p>{live.description}</p>
                    </div>

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
                        <div className="live-footer">
                            <p>Assista também pelo nosso aplicativo ou TV Box.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- 3. TESTIMONIALS --- */}
            <section className="midia-testimonials">
                <div className="container">
                    <div className="section-header">
                        <MessageSquare className="section-icon" />
                        <h2>Depoimentos</h2>
                        <p>Impacto do nosso ministério na vida das pessoas.</p>
                    </div>
                    <div className="testimonial-grid">
                        {testimonials && testimonials.map((t, idx) => (
                            <motion.div key={idx} className="testimonial-card" {...fadeIn} transition={{ delay: idx * 0.2 }}>
                                <p>"{t.text}"</p>
                                <div className="testimonial-author">
                                    <img src={t.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}`} alt={t.name} className="author-photo" />
                                    <div className="author-info">
                                        <h4>{t.name}</h4>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
                            <motion.div className="backstage-image" {...fadeIn}>
                                <img src={item.image} alt={item.title} />
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
                                    <img src={person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} alt={person.name} />
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
                            {gallery && gallery.length > 0 && gallery[galleryIndex] && (
                                <motion.div
                                    key={galleryIndex}
                                    className="gallery-slide"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <img src={gallery[galleryIndex].url} alt={gallery[galleryIndex].caption} />
                                    <div className="gallery-info">
                                        <p>{gallery[galleryIndex].caption}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {gallery && gallery.length > 1 && (
                            <>
                                <button className="carousel-btn prev" onClick={prevPhoto}><ChevronLeft /></button>
                                <button className="carousel-btn next" onClick={nextPhoto}><ChevronRight /></button>
                            </>
                        )}
                    </div>

                    <div className="thumb-grid">
                        {gallery && gallery.map((thumb, idx) => (
                            <div
                                key={idx}
                                className={`thumb-item ${idx === galleryIndex ? 'active' : ''}`}
                                onClick={() => setGalleryIndex(idx)}
                            >
                                <img src={thumb.url} alt={`Minis ${idx}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                                <img src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} />
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
                                <img src={item.image} alt={item.title} className="news-img" />
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
                            <a href="#" className="social-link"><Instagram /> {footer.social.instagram}</a>
                            <a href="#" className="social-link"><Youtube /> {footer.social.youtube}</a>
                            <a href="#" className="social-link"><Facebook /> {footer.social.facebook}</a>
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
        </div>
    );
};

export default Midia;
