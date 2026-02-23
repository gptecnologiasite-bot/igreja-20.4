import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/AuthService';
import activityTracker from './services/ActivityTracker';
import './PainelLogin.css';

const PainelLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [userType, setUserType] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [particles, setParticles] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const userTypes = [
        { value: '', label: 'Selecione o tipo de usuário (opcional)' },
        { value: 'admin', label: 'Administrador' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'lider', label: 'Líder de Ministério' },
        { value: 'secretario', label: 'Secretário' },
        { value: 'tesoureiro', label: 'Tesoureiro' },
        { value: 'membro', label: 'Membro' }
    ];

    useEffect(() => {
        if (location.state?.registered) {
            setSuccessMessage('Cadastro realizado com sucesso! Faça login para continuar.');
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [location]);

    // Load saved credentials and generate floating particles
    useEffect(() => {
        const savedEmail = localStorage.getItem('admac_remembered_email');
        const savedPassword = localStorage.getItem('admac_remembered_password');
        const isRemembered = localStorage.getItem('rememberMe') === 'true';

        if (isRemembered && savedEmail) {
            setEmail(savedEmail);
            setPassword(savedPassword || '');
            setRememberMe(true);
        }

        const generated = Array.from({ length: 18 }, (_, i) => ({
            id: i,
            size: Math.random() * 6 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 8,
            opacity: Math.random() * 0.4 + 0.1,
        }));
        setParticles(generated);
    }, []);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'E-mail inválido' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value && !validatePassword(value)) {
            setErrors(prev => ({ ...prev, password: 'Mínimo 6 caracteres' }));
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!email) newErrors.email = 'E-mail é obrigatório';
        else if (!validateEmail(email)) newErrors.email = 'E-mail inválido';
        if (!password) newErrors.password = 'Senha é obrigatória';
        else if (!validatePassword(password)) newErrors.password = 'Mínimo 6 caracteres';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const result = await authService.login(email, password);
            if (result.success) {
                const userData = result.user;
                if (userType && userType !== userData.userType) {
                    userData.userType = userType;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('admac_remembered_email', email);
                    localStorage.setItem('admac_remembered_password', password);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('admac_remembered_email');
                    localStorage.removeItem('admac_remembered_password');
                }

                try {
                    const loginEvent = await activityTracker.trackLogin(userData);
                    localStorage.setItem('currentSessionId', loginEvent.sessionId);
                } catch (error) {
                    console.error('Error tracking login:', error);
                }
                navigate('/painel/dashboard');
            } else {
                setErrors({ submit: 'E-mail ou senha incorretos' });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            setErrors({ submit: error.message || 'E-mail ou senha incorretos' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated Background */}
            <div className="login-bg">
                <div className="bg-gradient-orb orb-1" />
                <div className="bg-gradient-orb orb-2" />
                <div className="bg-gradient-orb orb-3" />
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            opacity: p.opacity,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Split Layout */}
            <div className="login-layout">

                {/* Left Panel — Brand */}
                <div className="login-brand">
                    <div className="brand-inner">
                        <div className="brand-logo-wrap">
                            <img src="/admac.png" alt="ADMAC Logo" className="brand-logo" />
                            <div className="brand-logo-glow" />
                        </div>
                        <h1 className="brand-title">ADMAC</h1>
                        <p className="brand-subtitle">Assembleia de Deus<br />Ministério de Madureira</p>
                        <div className="brand-divider" />
                        <div className="brand-verse">
                            <span className="verse-icon">✦</span>
                            <p>"Tudo posso naquele que me fortalece."</p>
                            <span className="verse-ref">Filipenses 4:13</span>
                        </div>
                        <div className="brand-features">
                            <div className="feature-item">
                                <span className="feature-icon">⛪</span>
                                <span>Gestão de Membros</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💰</span>
                                <span>Controle Financeiro</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📋</span>
                                <span>Relatórios Completos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div className="login-form-panel">
                    <div className="login-card">
                        {/* Card Header */}
                        <div className="card-header">
                            <div className="card-logo-mobile">
                                <img src="/admac.png" alt="ADMAC" />
                            </div>
                            <h2 className="card-title">Bem-vindo de volta</h2>
                            <p className="card-subtitle">Entre com suas credenciais para acessar o painel</p>
                        </div>

                        {/* Alerts */}
                        {successMessage && (
                            <div className="alert alert-success">
                                <span className="alert-icon">✓</span>
                                {successMessage}
                            </div>
                        )}
                        {errors.submit && (
                            <div className="alert alert-error">
                                <span className="alert-icon">!</span>
                                {errors.submit}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="login-form">

                            {/* Email */}
                            <div className={`field-group ${errors.email ? 'has-error' : ''} ${email ? 'has-value' : ''}`}>
                                <label htmlFor="email" className="field-label">E-mail</label>
                                <div className="field-input-wrap">
                                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        autoComplete="email"
                                    />
                                    <div className="field-underline" />
                                </div>
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>

                            {/* Password */}
                            <div className={`field-group ${errors.password ? 'has-error' : ''} ${password ? 'has-value' : ''}`}>
                                <label htmlFor="password" className="field-label">Senha</label>
                                <div className="field-input-wrap">
                                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Mostrar/ocultar senha"
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="field-underline" />
                                </div>
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </div>

                            {/* User Type */}
                            <div className="field-group">
                                <label htmlFor="userType" className="field-label">Tipo de Usuário</label>
                                <div className="field-input-wrap select-wrap">
                                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <select
                                        id="userType"
                                        value={userType}
                                        onChange={(e) => setUserType(e.target.value)}
                                    >
                                        {userTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    <div className="field-underline" />
                                </div>
                            </div>

                            {/* Options Row */}
                            <div className="form-options">
                                <label className="remember-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="custom-check">
                                        {rememberMe && (
                                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="2,6 5,9 10,3" />
                                            </svg>
                                        )}
                                    </span>
                                    <span>Manter conectado</span>
                                </label>
                                <a href="#" className="forgot-link">Esqueci a senha</a>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="btn-loading">
                                        <span className="btn-spinner" />
                                        Entrando...
                                    </span>
                                ) : (
                                    <span className="btn-content">
                                        Entrar no Painel
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12,5 19,12 12,19" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="card-footer">
                            <span>Não tem uma conta?</span>
                            <Link to="/painel/register">Cadastre-se</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainelLogin;
