// ================================================================
// Login.jsx — Página de autenticação do Painel Administrativo
// Suporta login com usuários salvos no localStorage e com a
// conta admin hardcoded (admin@admin.com / 123456).
// Também permite criar novos usuários via formulário de cadastro.
// ================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, ArrowRight } from 'lucide-react';
import '../css/Login.css';

const Login = () => {
  // Controla se o formulário exibido é de login ou de cadastro
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Lê os usuários salvos do localStorage para exibir a seleção rápida
  const [savedUsers, setSavedUsers] = useState(() => {
    const users = localStorage.getItem('admac_users');
    return users ? JSON.parse(users) : [];
  });
  const navigate = useNavigate();

  // Processa o login: verifica usuários do localStorage e admin hardcoded
  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('admac_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    // Aceita usuário do localStorage ou a conta admin padrão
    if (user || (email === 'admin@admin.com' && password === '123456')) {
      const userData = user || { name: 'Admin', email: 'admin@admin.com' };
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/painel');
    } else {
      alert('Email ou senha incorretos.');
    }
  };

  // Processa o cadastro de novo usuário e salva no localStorage
  const handleRegister = (e) => {
    e.preventDefault();
    if (name && email && password) {
      const newUser = { name, email, password };
      const users = JSON.parse(localStorage.getItem('admac_users') || '[]');

      if (users.find(u => u.email === email)) {
        alert('Este email já está cadastrado.');
        return;
      }

      const updatedUsers = [...users, newUser];
      localStorage.setItem('admac_users', JSON.stringify(updatedUsers));
      setSavedUsers(updatedUsers);
      setIsRegistering(false);
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  const selectUser = (user) => {
    setEmail(user.email);
    // Optional: Pre-fill password or focus password field
    document.getElementById('password').focus();
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-card">
          <div className="login-header">
            <h1>ADMAC Painel</h1>
            <p>{isRegistering ? 'Crie sua conta para acessar' : 'Bem-vindo de volta! Faça login para continuar.'}</p>
          </div>

          {/* User Selection List */}
          {!isRegistering && savedUsers.length > 0 && (
            <div className="user-selection" style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Selecionar usuário:</p>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {savedUsers.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => selectUser(user)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      minWidth: '60px'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-color)' }}>{user.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              {isRegistering ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
      <div className="login-video-section">
        {/* Placeholder para testes ou erro de carregamento */}
        <div className="video-fallback" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
          zIndex: -1
        }}></div>

        {import.meta.env.MODE !== 'test' && (
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&showinfo=0&modestbranding=1"
            title="ADMAC Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ opacity: 0.6 }}
            onError={(e) => e.target.style.display = 'none'}
          ></iframe>
        )}
        <div className="video-overlay"></div>
      </div>
    </div>
  );
};

export default Login;
