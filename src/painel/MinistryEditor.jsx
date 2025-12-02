import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Video } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

const MinistryEditor = ({ ministryId }) => {
  const [ministryData, setMinistryData] = useState(DatabaseService.getMinistryDefault(ministryId));

  useEffect(() => {
    DatabaseService.getMinistry(ministryId).then(setMinistryData);
  }, [ministryId]);

  const handleSave = async () => {
    const success = await DatabaseService.saveMinistry(ministryId, ministryData);
    if (success) {
      alert('Ministério salvo com sucesso!');
    } else {
      alert('Erro ao salvar ministério.');
    }
  };

  const getMinistryName = () => {
    const names = {
      kids: 'Kids',
      louvor: 'Louvor',
      jovens: 'Jovens',
      mulheres: 'Mulheres',
      lares: 'Lares',
      retiro: 'Retiros',
      social: 'Ação Social',
      midia: 'Mídia',
      ebd: 'EBD',
      intercessao: 'Intercessão',
      missoes: 'Missões \u0026 Ação Social'
    };
    return names[ministryId] || ministryId;
  };

  // Array management functions
  const addTeamMember = () => {
    const newMember = { name: '', role: '', photo: 'https://ui-avatars.com/api/?name=Novo+Membro&background=random' };
    setMinistryData({
      ...ministryData,
      team: [...(ministryData.team || []), newMember]
    });
  };

  const removeTeamMember = (index) => {
    const newTeam = ministryData.team.filter((_, i) => i !== index);
    setMinistryData({ ...ministryData, team: newTeam });
  };

  const addGalleryItem = () => {
    const newItem = { url: '', caption: '', title: '', text: '', updated: 'Agora' };
    setMinistryData({
      ...ministryData,
      gallery: [...(ministryData.gallery || []), newItem]
    });
  };

  const removeGalleryItem = (index) => {
    const newGallery = ministryData.gallery.filter((_, i) => i !== index);
    setMinistryData({ ...ministryData, gallery: newGallery });
  };

  const addTestimonial = () => {
    const newTestimonial = { name: '', text: '', photo: 'https://ui-avatars.com/api/?name=Nome&background=random', age: '' };
    setMinistryData({
      ...ministryData,
      testimonials: [...(ministryData.testimonials || []), newTestimonial]
    });
  };

  const removeTestimonial = (index) => {
    const newTestimonials = ministryData.testimonials.filter((_, i) => i !== index);
    setMinistryData({ ...ministryData, testimonials: newTestimonials });
  };

  return (
    <div className="dashboard-modern">
      <div className="page-header">
        <h1>Gerenciar Ministério: {getMinistryName()}</h1>
        <p>Edite as informações do ministério abaixo</p>
      </div>

      <div className="form-container">
        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Seção Hero</h2>
          </div>
          <div className="form-group">
            <label>Título Principal</label>
            <input
              type="text"
              value={ministryData.hero?.title || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                hero: { ...ministryData.hero, title: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Subtítulo</label>
            <input
              type="text"
              value={ministryData.hero?.subtitle || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                hero: { ...ministryData.hero, subtitle: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Versículo</label>
            <input
              type="text"
              value={ministryData.hero?.verse || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                hero: { ...ministryData.hero, verse: e.target.value }
              })}
              placeholder="Ex: 'Cantai ao Senhor...' - Salmos 96:1"
            />
          </div>
          <div className="form-group">
            <label><Video size={16} /> URL do Vídeo do YouTube</label>
            <input
              type="url"
              value={ministryData.hero?.videoUrl || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                hero: { ...ministryData.hero, videoUrl: e.target.value }
              })}
              placeholder="https://www.youtube.com/embed/..."
            />
            <small>Cole o link de incorporação do YouTube (embed)</small>
          </div>
        </div>

        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Missão</h2>
          </div>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={ministryData.mission?.title || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                mission: { ...ministryData.mission, title: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={ministryData.mission?.text || ''}
              onChange={(e) => setMinistryData({
                ...ministryData,
                mission: { ...ministryData.mission, text: e.target.value }
              })}
              rows={6}
            />
          </div>
        </div>

        {/* Team Management */}
        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Equipe</h2>
            <button onClick={addTeamMember} className="btn btn-success">
              <Plus size={16} /> Adicionar Membro
            </button>
          </div>
          {ministryData.team && ministryData.team.map((member, index) => (
            <div key={index} className="array-input-group">
              <div className="array-input-header">
                <strong>Membro #{index + 1}</strong>
                <button onClick={() => removeTeamMember(index)} className="remove-btn">
                  <Trash2 size={14} /> Remover
                </button>
              </div>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => {
                    const newTeam = [...ministryData.team];
                    newTeam[index].name = e.target.value;
                    setMinistryData({ ...ministryData, team: newTeam });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Cargo/Função</label>
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => {
                    const newTeam = [...ministryData.team];
                    newTeam[index].role = e.target.value;
                    setMinistryData({ ...ministryData, team: newTeam });
                  }}
                />
              </div>
              <div className="form-group">
                <label>URL da Foto</label>
                <input
                  type="url"
                  value={member.photo}
                  onChange={(e) => {
                    const newTeam = [...ministryData.team];
                    newTeam[index].photo = e.target.value;
                    setMinistryData({ ...ministryData, team: newTeam });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Management */}
        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Galeria</h2>
            <button onClick={addGalleryItem} className="btn btn-success">
              <Plus size={16} /> Adicionar Foto
            </button>
          </div>
          {ministryData.gallery && ministryData.gallery.map((item, index) => (
            <div key={index} className="array-input-group">
              <div className="array-input-header">
                <strong>Foto #{index + 1}</strong>
                <button onClick={() => removeGalleryItem(index)} className="remove-btn">
                  <Trash2 size={14} /> Remover
                </button>
              </div>
              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const newGallery = [...ministryData.gallery];
                    newGallery[index].url = e.target.value;
                    setMinistryData({ ...ministryData, gallery: newGallery });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Legenda</label>
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => {
                    const newGallery = [...ministryData.gallery];
                    newGallery[index].caption = e.target.value;
                    setMinistryData({ ...ministryData, gallery: newGallery });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Management */}
        {ministryData.testimonials !== undefined && (
          <div className="editor-card">
            <div className="editor-card-header">
              <h2>Testemunhos</h2>
              <button onClick={addTestimonial} className="btn btn-success">
                <Plus size={16} /> Adicionar Testemunho
              </button>
            </div>
            {ministryData.testimonials.map((testimonial, index) => (
              <div key={index} className="array-input-group">
                <div className="array-input-header">
                  <strong>Testemunho #{index + 1}</strong>
                  <button onClick={() => removeTestimonial(index)} className="remove-btn">
                    <Trash2 size={14} /> Remover
                  </button>
                </div>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => {
                      const newTestimonials = [...ministryData.testimonials];
                      newTestimonials[index].name = e.target.value;
                      setMinistryData({ ...ministryData, testimonials: newTestimonials });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Testemunho</label>
                  <textarea
                    value={testimonial.text}
                    onChange={(e) => {
                      const newTestimonials = [...ministryData.testimonials];
                      newTestimonials[index].text = e.target.value;
                      setMinistryData({ ...ministryData, testimonials: newTestimonials });
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="btn-group">
          <button onClick={handleSave} className="btn btn-primary">
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinistryEditor;
