import React from 'react';
import MinistryCard from './MinistryCard';
import { Users, Music, Zap, Heart, Home, Mountain, Monitor, BookOpen } from 'lucide-react';
import '../css/MinistryCarousel.css';

const MinistryCarousel = () => {
  const ministries = [
    { name: 'Kids', icon: <Users size={40} />, path: '/kids' },
    { name: 'Louvor', icon: <Music size={40} />, path: '/louvor' },
    { name: 'Jovens', icon: <Zap size={40} />, path: '/jovens' },
    { name: 'Mulheres', icon: <Heart size={40} />, path: '/mulheres' },
    { name: 'Lares', icon: <Home size={40} />, path: '/lares' },
    { name: 'Retiros', icon: <Mountain size={40} />, path: '/retiro' },
    { name: 'Mídia', icon: <Monitor size={40} />, path: '/midia' },
    { name: 'EBD', icon: <BookOpen size={40} />, path: '/edb' },
  ];

  return (
    <div className="ministry-carousel">
      <div className="ministry-grid">
        {ministries.map((ministry, index) => (
          <MinistryCard key={index} {...ministry} />
        ))}
      </div>
    </div>
  );
};

export default MinistryCarousel;
