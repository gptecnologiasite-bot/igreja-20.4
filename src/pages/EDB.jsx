import { BookOpen, Users, Clock, MapPin, GraduationCap, UserCheck, Download, Camera } from 'lucide-react';
import { useMinistryData } from '../hooks/useMinistryData';
import '../css/EDB.css';

const EDB = () => {
  const [data] = useMinistryData('ebd');

  return (
    <div className="edb-page">
      {/* Hero Section */}
      <div className="edb-hero">
        <GraduationCap size={64} className="hero-icon" />
        <h1>{data.hero?.title || 'Escola Bíblica Dominical'}</h1>
        <p className="hero-subtitle">{data.hero?.subtitle || 'Crescendo no conhecimento'}</p>
      </div>

      {/* Info Section */}
      <div className="edb-info">
        <div className="info-grid">
          <div className="info-item">
            <Clock className="icon" />
            <div>
              <strong>Horário</strong>
              <p>{data.info?.time || 'Domingos, 9h'}</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin className="icon" />
            <div>
              <strong>Local</strong>
              <p>{data.info?.location || 'ADMAC'}</p>
            </div>
          </div>
          <div className="info-item">
            <Users className="icon" />
            <div>
              <strong>Para Todos</strong>
              <p>{data.info?.audience || 'Todas as idades'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Section */}
      <div className="classes-section">
        <h2>Nossas Classes</h2>
        <p className="section-subtitle">Encontre a classe ideal para você ou sua família</p>

        <div className="classes-grid">
          {data.schedule && data.schedule.length > 0 ? (
            data.schedule.map((classItem, index) => {
              const className = classItem.title || classItem.class || `Classe ${index + 1}`;
              // Default icon logic
              const IconComponent = className.includes('Juniores') ? Users :
                className.includes('Adolescentes') ? UserCheck :
                  className.includes('Jovens') ? UserCheck : GraduationCap;
              return (
                <div key={index} className="class-card">
                  <div className="class-header">
                    <IconComponent className="class-icon" size={32} />
                    <div>
                      <h3>{className}</h3>
                      {(classItem.date || classItem.age) && (
                        <span className="age-badge">{classItem.date || classItem.age}</span>
                      )}
                    </div>
                  </div>
                  {classItem.description && (
                    <p className="class-description">{classItem.description}</p>
                  )}

                  {/* Teacher Section */}
                  {(classItem.image || classItem.teacher || classItem.time) && (
                    <div className="teacher-section">
                      <img
                        src={classItem.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(classItem.teacher || classItem.time || 'Professor')}
                        alt={classItem.teacher || classItem.time || 'Professor'}
                        className="teacher-photo"
                      />
                      <div className="teacher-info">
                        <strong>Professor(a)</strong>
                        <p>{classItem.teacher || classItem.time || 'A definir'}</p>
                      </div>
                    </div>
                  )}

                  {(classItem.location || classItem.room) && (
                    <div className="class-details">
                      <div className="detail-item">
                        <strong>Sala:</strong> {classItem.location || classItem.room}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button className="download-btn">
                    <Download size={18} />
                    Baixar Material
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Nenhuma classe cadastrada no momento. Em breve teremos novidades!
            </p>
          )}
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Líderes comprometidos com o ensino da Palavra</p>

          <div className="team-grid">
            {data.team && data.team.length > 0 ? (
              data.team.map((member, index) => (
                <div key={index} className="team-card">
                  <img src={member.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name || 'Membro')} alt={member.name || 'Membro'} className="team-photo" />
                  <h3>{member.name || 'Membro'}</h3>
                  <p>{member.role || ''}</p>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Informações da equipe em breve.
              </p>
            )}
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
            {data.gallery && data.gallery.length > 0 ? (
              data.gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={photo.url} alt={photo.caption || 'Foto da EBD'} />
                  <div className="gallery-overlay">
                    <span>{photo.caption || 'Momentos especiais'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Galeria de fotos em breve.
              </p>
            )}
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
