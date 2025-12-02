import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Book,
  Music,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import HeroCarousel from "../components/HeroCarousel";
import ActivitiesCarousel from "../components/ActivitiesCarousel";
import DatabaseService from "../services/DatabaseService";

const Home = () => {
  const [data, setData] = useState(DatabaseService.getHomeDataDefault());

  useEffect(() => {
    DatabaseService.getHomeData().then(setData);

    const handleStorageChange = () => {
      DatabaseService.getHomeData().then(setData);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const ministries = [
    {
      title: "Kids",
      description: "Ensinando a criança no caminho em que deve andar",
      link: "/kids",
      icon: "👶",
      color: "#ff6b9d",
    },
    {
      title: "Louvor",
      description: "Adorando a Deus em espírito e em verdade",
      link: "/louvor",
      icon: "🎵",
      color: "#9b59b6",
    },
    {
      title: "EBD",
      description: "Crescendo no conhecimento da Palavra",
      link: "/edb",
      icon: "📚",
      color: "#d4af37",
    },
    {
      title: "Ação Social",
      description: "Servindo ao próximo com amor",
      link: "/social",
      icon: "❤️",
      color: "#e74c3c",
    },
    {
      title: "Lares",
      description: "Comunhão e crescimento nos lares",
      link: "/lares",
      icon: "🏠",
      color: "#3498db",
    },
    {
      title: "Retiro",
      description: "Momentos de renovação espiritual",
      link: "/retiro",
      icon: "⛰️",
      color: "#27ae60",
    },
  ];

  return (
    <div className="home">
      {/* Hero Carousel */}
      <HeroCarousel slides={data.carousel} />

      {/* Welcome Section with Pastor */}
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-content">
            <div className="pastor-card">
              <div className="pastor-image">
                <img src={data.pastor.image} alt={data.pastor.name} />
              </div>
              <div className="pastor-info">
                <h3>{data.pastor.name}</h3>
                <p className="pastor-title">{data.pastor.title}</p>
                <p className="pastor-verse">{data.pastor.verse}</p>
              </div>
            </div>
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

      {/* Spotify Podcast Section */}
      <section className="spotify-section">
        <div className="container">
          <h2>Ouça Nossas Mensagens</h2>
          <p className="section-subtitle">
            Podcast com as pregações e estudos bíblicos da ADMAC
          </p>

          <div className="spotify-wrapper">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/episode/6vf8aTHBG3ms8DGo5jCsAG?utm_source=generator"
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

          <div className="location-info">
            <MapPin size={20} />
            <span>QN 516 - Samambaia, Brasília - DF</span>
          </div>
        </div>
      </section>

      {/* Ministries Section */}
      <section className="ministries-home-section">
        <div className="container">
          <h2>Nossos Ministérios</h2>
          <p className="section-subtitle">
            Conheça as áreas de atuação da nossa igreja
          </p>

          <div className="ministries-home-grid">
            {ministries.map((ministry, index) => (
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

      {/* Activities Section */}
      <section className="activities-home-section">
        <div className="container">
          <h2>Atividades em Destaque</h2>
          <p className="section-subtitle">
            Veja o que está acontecendo na igreja
          </p>

          <ActivitiesCarousel activities={data.activities} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-home-section">
        <div className="container">
          <h2>Faça Parte da Nossa Família</h2>
          <p>
            Venha nos visitar e experimente o amor de Deus em nossa comunidade
          </p>
          <div className="cta-home-buttons">
            <Link to="/contato" className="cta-home-btn primary">
              Quero Visitar
            </Link>
            <a href="tel:+5561993241084" className="cta-home-btn secondary">
              <Phone size={18} /> Ligar Agora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
