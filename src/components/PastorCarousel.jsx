import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/PastorCarousel.css';

const PastorCarousel = ({ pastors }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || !pastors || pastors.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % pastors.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, pastors]);

    if (!pastors || pastors.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? pastors.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % pastors.length);
    };

    const goToSlide = (index) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    const currentPastor = pastors[currentIndex];

    return (
        <div className="pastor-carousel">
            <div className="pastor-card">
                {/* Navigation Arrows */}
                {pastors.length > 1 && (
                    <>
                        <button
                            className="carousel-arrow carousel-arrow-left"
                            onClick={goToPrevious}
                            aria-label="Pastor anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="carousel-arrow carousel-arrow-right"
                            onClick={goToNext}
                            aria-label="Próximo pastor"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Pastor Content */}
                <div className="pastor-image">
                    <img src={currentPastor.image} alt={currentPastor.name} />
                </div>
                <div className="pastor-info">
                    <h3>{currentPastor.name}</h3>
                    <p className="pastor-title">{currentPastor.title}</p>
                    <p className="pastor-verse">{currentPastor.verse}</p>
                </div>
            </div>

            {/* Dots Indicator */}
            {pastors.length > 1 && (
                <div className="carousel-dots">
                    {pastors.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Ir para pastor ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastorCarousel;
