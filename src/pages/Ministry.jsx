import React from 'react';
import { Clock, MapPin, Calendar, Heart } from 'lucide-react';
import '../css/Ministry.css';

const Ministry = ({ title, subtitle, description, schedule }) => {
  return (
    <div className="ministry-page">
      <div className="ministry-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="container">
        <div className="info-grid">
          <div className="info-card">
            <div className="icon-circle"></div>
            <h3>Sobre o Ministério</h3>
            <p>{description}</p>
          </div>
          <div className="info-card">
            <div className="icon-circle"></div>
            <h3>Horários</h3>
            <ul className="schedule-list">
              {schedule.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="section-title">Nossas Atividades</h2>
        <div className="activities-grid">
          <div className="activity-card">
            <div className="activity-icon"></div>
            <h3>Estudo Bíblico</h3>
            <p>Estudo profundo da palavra de Deus e seus princípios.</p>
          </div>
          <div className="activity-card">
            <div className="activity-icon"></div>
            <h3>Encontros</h3>
            <p>Momentos de comunhão e fortalecimento.</p>
          </div>
          <div className="activity-card">
            <div className="activity-icon"></div>
            <h3>Ação Social</h3>
            <p>Projetos sociais e ações de impacto na comunidade.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ministry;
