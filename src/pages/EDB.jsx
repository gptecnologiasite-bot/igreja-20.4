import { BookOpen, Users, Clock, MapPin, GraduationCap, UserCheck, Download, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/EDB.css';
import DatabaseService from '../services/DatabaseService';

const EDB = () => {
  const [data, setData] = useState(DatabaseService.getMinistryDefault('ebd'));

  useEffect(() => {
    DatabaseService.getMinistry('ebd').then(setData);

    const handleStorageChange = () => {
      DatabaseService.getMinistry('ebd').then(setData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="edb-page">
      {/* Hero Section */}
      <div className="edb-hero">
        <GraduationCap size={64} className="hero-icon" />
        <h1>{data.hero.title}</h1>
        <p className="hero-subtitle">{data.hero.subtitle}</p>
      </div>

      {/* Info Section */}
      <div className="edb-info">
        <div className="info-grid">
          <div className="info-item">
            <Clock className="icon" />
            <div>
              <strong>Horário</strong>
              <p>{data.info.time}</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin className="icon" />
            <div>
              <strong>Local</strong>
              <p>{data.info.location}</p>
            </div>
          </div>
          <div className="info-item">
            <Users className="icon" />
            <div>
              <strong>Para Todos</strong>
              <p>{data.info.audience}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Section */}
      <div className="classes-section">
        <h2>Nossas Classes</h2>
        <p className="section-subtitle">Encontre a classe ideal para você ou sua família</p>
        
        <div className="classes-grid">
          {data.schedule.map((classItem, index) => {
            // Default icon logic
            const IconComponent = classItem.title.includes('Juniores') ? Users :
                                  classItem.title.includes('Adolescentes') ? UserCheck :
                                  classItem.title.includes('Jovens') ? UserCheck : GraduationCap;
            return (
              <div key={index} className="class-card">
                <div className="class-header">
                  <IconComponent className="class-icon" size={32} />
                  <div>
                    <h3>{classItem.title}</h3>
                    <span className="age-badge">{classItem.date}</span> {/* Age Range */}
                  </div>
                </div>
                <p className="class-description">{classItem.description}</p>
                
                {/* Teacher Section */}
                <div className="teacher-section">
                  <img 
                    src={classItem.image} 
                    alt={classItem.time}
                    className="teacher-photo"
                  />
                  <div className="teacher-info">
                    <strong>Professor(a)</strong>
                    <p>{classItem.time}</p> {/* Teacher Name */}
                  </div>
                </div>

                <div className="class-details">
                  <div className="detail-item">
                    <strong>Sala:</strong> {classItem.location}
                  </div>
                </div>

                {/* Download Button */}
                <button className="download-btn">
                  <Download size={18} />
                  Baixar Material
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Líderes comprometidos com o ensino da Palavra</p>
          
          <div className="team-grid">
            {data.team.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.photo} alt={member.name} className="team-photo" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <div className="container">
          <div className="section-header">
            <Camera size={32} />
            <h2>Galeria de Fotos</h2>
          </div>
          <p className="section-subtitle">Momentos especiais da nossa EBD</p>
          
          <div className="gallery-grid">
            {data.gallery.map((photo, index) => (
              <div key={index} className="gallery-item">
                <img src={photo.url} alt={photo.caption} />
                <div className="gallery-overlay">
                  <span>{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="edb-cta">
        <h2>Venha Fazer Parte!</h2>
        <p>A EBD é um momento especial de aprendizado e comunhão. Traga sua família e cresça conosco no conhecimento de Deus.</p>
        <button className="cta-button">
          <BookOpen size={18} /> Quero Participar
        </button>
      </div>
    </div>
  );
};

export default EDB;
