import { useMinistryData } from '../hooks/useMinistryData';

const Ministry = ({ id, ...fallbackProps }) => {
  const [data] = useMinistryData(id || 'default');

  const title = data?.hero?.title || fallbackProps.title;
  const subtitle = data?.hero?.subtitle || fallbackProps.subtitle;
  const description = data?.mission?.text || fallbackProps.description;
  const schedule = Array.isArray(data?.schedule)
    ? data.schedule.map(s => `${s.day || ''} ${s.time || ''} ${s.activity || ''}`)
    : fallbackProps.schedule || [];
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

        {/* --- Seção Aniversariantes --- */}
        {data?.birthdays && (
          <div className="ministry-birthdays" style={{ marginTop: '4rem', padding: '3rem 2rem', background: 'var(--surface-color)', borderRadius: '24px', textAlign: 'center' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>{data.birthdays.title || "Aniversariantes do Mês"}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>{data.birthdays.text}</p>

            {data.birthdays.videoUrl && (
              <div style={{ marginBottom: '3rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                <iframe
                  width="100%"
                  height="400"
                  src={data.birthdays.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title="Vídeo Aniversariantes"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block' }}
                ></iframe>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem', justifyContent: 'center' }}>
              {data.birthdays.people && data.birthdays.people.map((person, index) => (
                <div key={index} style={{
                  background: 'var(--bg-color)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  cursor: 'default'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img
                    src={person.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                    alt={person.name}
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid var(--accent-light)' }}
                  />
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', color: 'var(--text-color)' }}>{person.name}</h4>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '600', padding: '0.2rem 0.8rem', background: 'var(--accent-glow)', borderRadius: '20px' }}>{person.date}</span>
                </div>
              ))}
            </div>
            {(!data.birthdays.people || data.birthdays.people.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhum aniversariante cadastrado para este mês.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Ministry;
