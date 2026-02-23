import React from 'react';
import { Church, Heart, Users, Book, Star, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/Sobre.css';

const Sobre = () => {
    const [data] = useMinistryData('sobre');

    return (
        <div className="sobre-page">
            {/* Hero Section */}
            <div className="sobre-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <Church size={80} className="hero-icon" />
                    <h1>{data.hero?.title || 'Sobre a ADMAC'}</h1>
                    <p className="hero-subtitle">{data.hero?.subtitle || 'Nossa história, missão e valores'}</p>
                    {data.hero?.verse && (
                        <div className="hero-verse">
                            <p>{data.hero.verse}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <h2>{data.mission?.title || 'Nossa Missão'}</h2>
                    <p className="mission-text">{data.mission?.text || ''}</p>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2>Nossos Valores</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <Book size={40} />
                            <h3>Palavra de Deus</h3>
                            <p>A Bíblia é nossa regra de fé e prática</p>
                        </div>
                        <div className="value-card">
                            <Heart size={40} />
                            <h3>Amor</h3>
                            <p>Amar a Deus e ao próximo como a nós mesmos</p>
                        </div>
                        <div className="value-card">
                            <Users size={40} />
                            <h3>Comunhão</h3>
                            <p>Crescer juntos como família de Deus</p>
                        </div>
                        <div className="value-card">
                            <Star size={40} />
                            <h3>Excelência</h3>
                            <p>Servir a Deus com o melhor que temos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team/Leadership Section */}
            {data.team && data.team.length > 0 && (
                <section className="team-section">
                    <div className="container">
                        <h2>Nossa Liderança</h2>
                        <p className="section-subtitle">Pastores e líderes dedicados ao serviço</p>
                        <div className="team-grid">
                            {data.team.map((member, index) => (
                                <div key={index} className="team-card">
                                    <img
                                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Membro')}`}
                                        alt={member.name || 'Membro'}
                                        className="team-photo"
                                    />
                                    <h3>{member.name}</h3>
                                    <p>{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery Section */}
            {data.gallery && data.gallery.length > 0 && (
                <section className="gallery-section">
                    <div className="container">
                        <h2>Galeria</h2>
                        <div className="gallery-grid">
                            {data.gallery.map((photo, index) => (
                                <div key={index} className="gallery-item">
                                    <img src={photo.url} alt={photo.caption || 'Foto'} />
                                    <div className="gallery-overlay">
                                        <span>{photo.caption}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Info Section */}
            <section className="info-section">
                <div className="container">
                    <h2>Informações</h2>
                    <div className="info-grid">
                        <div className="info-card">
                            <MapPin size={32} />
                            <h3>Endereço</h3>
                            <p>QN 404 Conjunto A Lote 1</p>
                            <p>Samambaia Norte, DF</p>
                        </div>
                        <div className="info-card">
                            <Clock size={32} />
                            <h3>Horários de Culto</h3>
                            <p>Domingo: 9h e 18h</p>
                            <p>Quarta: 19h30</p>
                        </div>
                        <div className="info-card">
                            <Phone size={32} />
                            <h3>Contato</h3>
                            <p>(61) 99324-1084</p>
                        </div>
                        <div className="info-card">
                            <Mail size={32} />
                            <h3>Email</h3>
                            <p>contato@admac.com.br</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Sobre;
