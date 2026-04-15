import { useMinistryData } from '../hooks/useMinistryData';
import { transformImageLink } from '../utils/imageUtils';
import '../css/Ministry.css';

const Ministry = ({ id, ...fallbackProps }) => {
  const [data] = useMinistryData(id || 'default');

  const title = data?.hero?.title || fallbackProps.title;
  const subtitle = data?.hero?.subtitle || fallbackProps.subtitle;
  const description = data?.mission?.text || fallbackProps.description;
  const heroImage = data?.hero?.image || fallbackProps.image;

  const schedule = Array.isArray(data?.schedule)
    ? data.schedule.map(s => `${s.day || ''} ${s.time || ''} ${s.activity || ''}`)
    : fallbackProps.schedule || [];

  const activities = Array.isArray(data?.activities) && data.activities.length > 0
    ? data.activities
    : (fallbackProps.activities || [
      {
        title: 'Estudo Bíblico',
        description: 'Estudo profundo da palavra de Deus e seus princípios.',
        icon: '📖'
      },
      {
        title: 'Encontros',
        description: 'Momentos de comunhão e fortalecimento.',
        icon: '🤝'
      },
      {
        title: 'Ação Social',
        description: 'Projetos sociais e ações de impacto na comunidade.',
        icon: '❤️'
      }
    ]);

  return (
    <div className="ministry-page">
      <div
        className="ministry-hero"
        style={heroImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("${transformImageLink(heroImage)}")` } : {}}
      >
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
          {activities.map((activity, index) => (
            <div key={index} className="activity-card">
              {activity.image ? (
                <img
                  src={transformImageLink(activity.image)}
                  alt={activity.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }}
                />
              ) : (
                <div className="activity-icon" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                  {activity.icon || '✨'}
                </div>
              )}
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              {activity.date && <small style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{activity.date}</small>}
            </div>
          ))}
        </div>

        {/* --- Seção Aniversariantes --- */}
        {data?.birthdays && (
          <div className="ministry-birthdays-section">
            <h2 className="section-title">{data.birthdays.title || "Aniversariantes do Mês"}</h2>
            <p className="birthdays-subtitle">{data.birthdays.text}</p>

            {data.birthdays.videoUrl && (
              <div className="video-wrapper">
                {data.birthdays.videoUrl.includes('youtube.com') || data.birthdays.videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={data.birthdays.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                    title="Vídeo Aniversariantes"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img
                    src={transformImageLink(data.birthdays.videoUrl)}
                    alt="Capa Aniversariantes"
                    className="video-cover-img"
                  />
                )}
              </div>
            )}

            <div className="birthdays-grid">
              {data.birthdays.people && data.birthdays.people.map((person, index) => (
                <div key={index} className="birthday-card team-card-style">
                  <img
                    src={transformImageLink(person.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                    alt={person.name}
                    className="birthday-photo"
                  />
                  <h4 className="birthday-name">{person.name}</h4>
                  <span className="birthday-date">{person.date}</span>
                </div>
              ))}
            </div>
            {(!data.birthdays.people || data.birthdays.people.length === 0) && (
              <p className="birthdays-empty">Nenhum aniversariante ou líder cadastrado no momento.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Ministry;
