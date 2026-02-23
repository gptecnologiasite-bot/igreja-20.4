import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/HeroCarousel.css';

const HeroCarousel = ({ slides: propSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default hardcoded slides as fallback
  const defaultSlides = [
    {
      title: 'Bem-vindo à ADMAC',
      subtitle: 'Assembleia de Deus Ministério Atos e Conquistas',
      image: '/bem vindo.jpg'
    },
    {
      title: 'Cultos Presenciais',
      subtitle: 'Domingo às 18h e Quarta às 19h30',
      image: '/culto1.jpg.png'
    },
    {
      title: 'Junte-se a Nós',
      subtitle: 'Faça parte da nossa família',
      image: '/banner2.png'
    }
  ];

  // Use prop slides if available, otherwise use default
  const slides = propSlides && propSlides.length > 0 ? propSlides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="hero-carousel">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url("${slide.image}")` }}
        >
          <div className="carousel-content">
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
          </div>
        </div>
      ))}

      <button className="carousel-btn prev" onClick={prevSlide}>
        <ChevronLeft size={32} />
      </button>
      <button className="carousel-btn next" onClick={nextSlide}>
        <ChevronRight size={32} />
      </button>

      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
