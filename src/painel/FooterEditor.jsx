import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

const FooterEditor = () => {
  const [footerData, setFooterData] = useState(DatabaseService.getFooterDataDefault());

  useEffect(() => {
    DatabaseService.getFooterData().then(setFooterData);

    const handleStorageChange = () => {
      DatabaseService.getFooterData().then(setFooterData);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSave = async () => {
    const success = await DatabaseService.saveFooterData(footerData);
    if (success) {
      alert('Rodapé salvo com sucesso!');
    } else {
      alert('Erro ao salvar rodapé.');
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>Gerenciar Rodapé</h2>
        <button onClick={handleSave} className="btn-primary">
          <Save size={20} />
          Salvar Alterações
        </button>
      </div>

      <div className="editor-form">
        <div className="form-section">
          <h3>Informações de Contato</h3>
          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              value={footerData.contact.address}
              onChange={(e) => setFooterData({
                ...footerData,
                contact: { ...footerData.contact, address: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              value={footerData.contact.phone}
              onChange={(e) => setFooterData({
                ...footerData,
                contact: { ...footerData.contact, phone: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={footerData.contact.email}
              onChange={(e) => setFooterData({
                ...footerData,
                contact: { ...footerData.contact, email: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Redes Sociais</h3>
          <div className="form-group">
            <label>Facebook</label>
            <input
              type="text"
              value={footerData.social.facebook}
              onChange={(e) => setFooterData({
                ...footerData,
                social: { ...footerData.social, facebook: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              value={footerData.social.instagram}
              onChange={(e) => setFooterData({
                ...footerData,
                social: { ...footerData.social, instagram: e.target.value }
              })}
            />
          </div>
          <div className="form-group">
            <label>YouTube</label>
            <input
              type="text"
              value={footerData.social.youtube}
              onChange={(e) => setFooterData({
                ...footerData,
                social: { ...footerData.social, youtube: e.target.value }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterEditor;
