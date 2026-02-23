import { Video, Camera, Mic, Monitor, Youtube, Instagram, Facebook, Share2, Users, Play, Image, Film } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Midia.css';
import { useMinistryData } from '../hooks/useMinistryData';
import DatabaseService from '../services/DatabaseService';

const Midia = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    area: '',
    message: ''
  });

  const [data] = useMinistryData('midia');
  const [dynamicVideos, setDynamicVideos] = useState([]);

  useEffect(() => {
    const loadDynamicVideos = async () => {
      const videos = await DatabaseService.getVideos();
      setDynamicVideos(videos.filter(v => v.active !== false));
    };
    loadDynamicVideos();

    const handleStorageChange = (e) => {
      if (e.key === 'admac_videos') loadDynamicVideos();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Merge hardcoded videos with dynamic ones
  const allVideos = [...(dynamicVideos.map(v => ({
    title: v.title,
    videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
    date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
    views: 'Novo'
  }))), ...(data.videos || [])].slice(0, 6);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato.');
    setFormData({ name: '', email: '', area: '', message: '' });
  };

  return (
    <div className="midia-page">
      {/* Hero Section */}
      <div className="midia-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Monitor size={80} className="hero-icon" />
          <h1>{data.hero?.title || 'Ministério de Mídia'}</h1>
          <p className="hero-subtitle">{data.hero?.subtitle || ''}</p>
          {data.hero?.verse && (
            <div className="hero-verse">
              <p>{data.hero.verse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Stream Section */}
      <section className="live-section">
        <div className="container">
          <div className="section-header">
            <Youtube size={32} />
            <h2>Nossos Cultos Online</h2>
          </div>
          <p className="section-subtitle">Acompanhe nossas transmissões ao vivo</p>

          <div className="video-highlight">
            <div className="video-wrapper">
              {data.live?.videoUrl ? (
                <iframe
                  width="100%"
                  height="500"
                  src={data.live.videoUrl}
                  title="Culto Ao Vivo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{
                  width: '100%',
                  height: '500px',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Youtube size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Transmissão ao vivo em breve</p>
                    <a
                      href={data.live?.youtubeChannel || 'https://www.youtube.com/@ADMAC'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary-color)',
                        color: '#000',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Acessar Canal no YouTube
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="live-info">
              <span className="live-badge">AO VIVO</span>
              <h3>{data.live?.title || 'Culto da Família'}</h3>
              <p>{data.live?.time || 'Domingos 18h'}</p>
              <a
                href={data.live?.youtubeChannel || 'https://www.youtube.com/@ADMAC'}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-btn"
              >
                <Youtube size={20} /> Inscreva-se no Canal
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Videos */}
      <section className="videos-section">
        <div className="container">
          <h2>Últimas Transmissões</h2>
          <div className="videos-grid">
            {allVideos && allVideos.length > 0 ? (
              allVideos.map((video, index) => (
                <a
                  key={index}
                  href={video.url || video.videoUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="video-thumbnail">
                    <img src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop'} alt={video.title || 'Vídeo'} />
                    <div className="play-overlay">
                      <Play size={40} fill="white" />
                    </div>
                  </div>
                  <div className="video-info">
                    <h3>{video.title || 'Vídeo'}</h3>
                    <div className="video-meta">
                      {video.date && <span>{video.date}</span>}
                      {video.views && <span>{video.views} visualizações</span>}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Nenhum vídeo disponível no momento. Em breve teremos novidades!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Areas of Action */}
      <section className="areas-section">
        <div className="container">
          <h2>Nossas Áreas</h2>
          <div className="areas-grid">
            <div className="area-card">
              <Video size={40} />
              <h3>Transmissão</h3>
              <p>Levando o culto para quem não pode estar presente</p>
            </div>
            <div className="area-card">
              <Camera size={40} />
              <h3>Fotografia</h3>
              <p>Registrando momentos especiais da nossa comunhão</p>
            </div>
            <div className="area-card">
              <Mic size={40} />
              <h3>Áudio</h3>
              <p>Garantindo a excelência no som para adoração</p>
            </div>
            <div className="area-card">
              <Share2 size={40} />
              <h3>Social Media</h3>
              <p>Compartilhando o evangelho nas redes sociais</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="section-subtitle">Voluntários dedicados à excelência</p>
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
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <h2>Bastidores</h2>
          <div className="gallery-grid">
            {data.gallery && data.gallery.length > 0 ? (
              data.gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={photo.url} alt={photo.caption || 'Foto'} />
                  <div className="gallery-overlay">
                    <span>{photo.caption || 'Bastidores'}</span>
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
      </section>

      {/* Volunteer Form */}
      <section className="volunteer-section">
        <div className="container">
          <div className="form-container">
            <div className="form-header">
              <Film size={32} />
              <h2>Seja um Voluntário</h2>
              <p>Quer servir a Deus com seus talentos na área de mídia?</p>
            </div>

            <form onSubmit={handleSubmit} className="media-form">
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Seu nome"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label>Área de Interesse</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                >
                  <option value="">Selecione uma área</option>
                  <option value="video">Vídeo / Transmissão</option>
                  <option value="audio">Áudio / Som</option>
                  <option value="photo">Fotografia</option>
                  <option value="design">Design / Social Media</option>
                  <option value="projection">Projeção</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mensagem / Experiência</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="4"
                  placeholder="Conte-nos um pouco sobre sua experiência (se houver)"
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Enviar Inscrição
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Midia;
