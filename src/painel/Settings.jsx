import React, { useState } from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('admac_user');
    return savedUser ? JSON.parse(savedUser) : { name: '', email: '' };
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('admac_theme') || 'dark';
  });

  const handleSave = () => {
    localStorage.setItem('admac_user', JSON.stringify(user));
    localStorage.setItem('admac_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Configurações</h2>
        <button onClick={handleSave} className="btn-primary">
          <Save size={20} />
          Salvar Configurações
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Perfil do Usuário</h3>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Aparência</h3>
          <div className="form-group">
            <label>Tema</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Sistema</h3>
          <p>Versão: 1.0.0</p>
          <p>Banco de Dados: localStorage</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
