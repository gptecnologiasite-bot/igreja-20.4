import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

const HomeEditor = () => {
  const [homeData, setHomeData] = useState(DatabaseService.getHomeDataDefault());

  useEffect(() => {
    DatabaseService.getHomeData().then(setHomeData);
  }, []);

  const handleSave = async () => {
    const success = await DatabaseService.saveHomeData(homeData);
    if (success) {
      alert('Home salva com sucesso!');
    } else {
      alert('Erro ao salvar Home.');
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>Gerenciar Home</h2>
        <button onClick={handleSave} className="btn-primary">
          <Save size={20} />
          Salvar Alterações
        </button>
      </div>

      <div className="editor-form">
        <div className="form-section">
          <h3>Mensagem de Boas-Vindas</h3>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={homeData.welcome.title}
              onChange={(e) => setHomeData({
                ...homeData,
                welcome: { ...homeData.welcome, title: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Texto 1</label>
            <textarea
              value={homeData.welcome.text1}
              onChange={(e) => setHomeData({
                ...homeData,
                welcome: { ...homeData.welcome, text1: e.target.value }
              })}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Texto 2</label>
            <textarea
              value={homeData.welcome.text2}
              onChange={(e) => setHomeData({
                ...homeData,
                welcome: { ...homeData.welcome, text2: e.target.value }
              })}
              rows={4}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Informações do Pastor</h3>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={homeData.pastor.name}
              onChange={(e) => setHomeData({
                ...homeData,
                pastor: { ...homeData.pastor, name: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Cargo</label>
            <input
              type="text"
              value={homeData.pastor.title}
              onChange={(e) => setHomeData({
                ...homeData,
                pastor: { ...homeData.pastor, title: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Versículo</label>
            <input
              type="text"
              value={homeData.pastor.verse}
              onChange={(e) => setHomeData({
                ...homeData,
                pastor: { ...homeData.pastor, verse: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>URL da Imagem</label>
            <input
              type="text"
              value={homeData.pastor.image}
              onChange={(e) => setHomeData({
                ...homeData,
                pastor: { ...homeData.pastor, image: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Atividades em Destaque</h3>
            <button 
              onClick={() => {
                const newActivity = {
                  title: 'Nova Atividade',
                  date: 'Data',
                  description: 'Descrição da atividade',
                  image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop'
                };
                setHomeData({
                  ...homeData,
                  activities: [...homeData.activities, newActivity]
                });
              }}
              className="btn btn-success"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span> Adicionar Atividade
            </button>
          </div>
          
          {homeData.activities.map((activity, index) => (
            <div key={index} style={{ 
              background: 'var(--card-bg)', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong>Atividade #{index + 1}</strong>
                <button 
                  onClick={() => {
                    const newActivities = homeData.activities.filter((_, i) => i !== index);
                    setHomeData({ ...homeData, activities: newActivities });
                  }}
                  style={{ 
                    background: 'var(--danger-color)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Remover
                </button>
              </div>
              
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => {
                    const newActivities = [...homeData.activities];
                    newActivities[index].title = e.target.value;
                    setHomeData({ ...homeData, activities: newActivities });
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Data/Badge</label>
                <input
                  type="text"
                  value={activity.date}
                  onChange={(e) => {
                    const newActivities = [...homeData.activities];
                    newActivities[index].date = e.target.value;
                    setHomeData({ ...homeData, activities: newActivities });
                  }}
                  placeholder="Ex: 1º Sábado do Mês"
                />
              </div>
              
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={activity.description}
                  onChange={(e) => {
                    const newActivities = [...homeData.activities];
                    newActivities[index].description = e.target.value;
                    setHomeData({ ...homeData, activities: newActivities });
                  }}
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  value={activity.image}
                  onChange={(e) => {
                    const newActivities = [...homeData.activities];
                    newActivities[index].image = e.target.value;
                    setHomeData({ ...homeData, activities: newActivities });
                  }}
                  placeholder="https://..."
                />
                {activity.image && (
                  <img 
                    src={activity.image} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '300px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      marginTop: '0.5rem' 
                    }} 
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeEditor;
