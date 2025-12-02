import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/ActivitiesCarousel.css';

const ActivitiesCarousel = ({ activities = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(activities.length / itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="activities-carousel-empty">
        <p>Nenhuma atividade cadastrada</p>
      </div>
    );
  }

  return (
    <div className="activities-carousel-container">
      <div className="activities-carousel-wrapper">
        <div 
          className="activities-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className="activity-carousel-card"
              style={{ minWidth: `${100 / itemsPerView}%` }}
            >
              <div className="activity-carousel-image-wrapper">
                <img 
                  src={activity.image} 
                  alt={activity.title}
                  className="activity-carousel-image"
                />
                <div className="activity-carousel-badge">
                  {activity.date}
                </div>
                <div className="activity-carousel-overlay"></div>
              </div>
              <div className="activity-carousel-content">
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <button 
            className="carousel-nav-btn carousel-nav-prev" 
            onClick={prevSlide}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="carousel-nav-btn carousel-nav-next" 
            onClick={nextSlide}
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>

          <div className="carousel-dots">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivitiesCarousel;
