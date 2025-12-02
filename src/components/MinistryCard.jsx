import React from 'react';
import '../css/MinistryCarousel.css';

const MinistryCard = ({ name, icon, path }) => {
  return (
    <div className="ministry-card">
      <div className="ministry-icon">{icon}</div>
      <h3>{name}</h3>
      <a href={path} className="ministry-link">Saiba Mais</a>
    </div>
  );
};

export default MinistryCard;
