import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, Menu, List } from 'lucide-react';
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
    const navigate = useNavigate();
    const location = useLocation();

    // User type options for the list selection
    const userTypes = [
        { value: '', label: 'Selecione o tipo de usuário (opcional)' },
        { value: 'admin', label: 'Administrador' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'lider', label: 'Líder de Ministério' },
        { value: 'secretario', label: 'Secretário' },
        { value: 'tesoureiro', label: 'Tesoureiro' },
        { value: 'membro', label: 'Membro' }
    ];

    // Check for registration success message
    React.useEffect(() => {
        if (location.state?.registered) {
            setSuccessMessage('Cadastro realizado com sucesso! Faça login para continuar.');
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [location]);

    // Real-time email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Real-time password validation
    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // Handle input changes with validation
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
            setErrors(prev => ({ ...prev, password: 'Senha deve ter pelo menos 6 caracteres' }));
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear all previous errors first
        setErrors({});

        // Validate all fields
        const newErrors = {};
        if (!email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Start loading
        setIsLoading(true);

        try {
            // Login com AuthService (Supabase ou localStorage)
            const result = await authService.login(email, password);

            if (result.success) {
                console.log('✅ Login bem-sucedido:', result);

                const userData = result.user;

                // Atualizar userType se foi selecionado
                if (userType && userType !== userData.userType) {
                    userData.userType = userType;
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                // Salvar preferência "lembrar-me"
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Track login activity
                try {
                    const loginEvent = await activityTracker.trackLogin(userData);
                    localStorage.setItem('currentSessionId', loginEvent.sessionId);
                } catch (error) {
                    console.error('Error tracking login:', error);
                }

                // Redirect to dashboard
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
        <div className="painel-login-container">
            {/* Sidebar */}
            <div className="painel-sidebar">
                <div className="sidebar-logo">
                    <img src="/admac.png" alt="ADMAC Logo" />
                    <h2>ADMAC</h2>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item active">
                        <User size={20} />
                        <span>Login</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="painel-main">
                {/* Header */}
                <div className="painel-header">
                    <div className="header-left">
                        <button className="menu-toggle">
                            <Menu size={24} />
                        </button>
                        <h1>Área Administrativa ADMAC</h1>
                    </div>
                    <div className="header-right">
                        <img src="/admac.png" alt="ADMAC" className="header-logo" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="painel-content">
                    <div className="login-form-wrapper">
                        <div className="login-form-card">
                            {/* Logo in Form */}
                            <div className="form-logo">
                                <img src="/admac.png" alt="ADMAC Logo" />
                            </div>

                            {/* Form Header */}
                            <div className="form-header">
                                <h2>Login ADMAC</h2>
                                <p>Bem-vindo de volta! Faça login para continuar.</p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="login-form">
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="success-message">{successMessage}</div>
                                )}

                                {/* Email Field */}
                                <div className="form-group">
                                    <label htmlFor="email">E-mail ou Usuário</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={20} />
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={handleEmailChange}
                                            className={errors.email ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                {/* Password Field */}
                                <div className="form-group">
                                    <label htmlFor="password">Senha</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={errors.password ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                {/* User Type Selection */}
                                <div className="form-group">
                                    <label htmlFor="userType">Tipo de Usuário</label>
                                    <div className="input-wrapper">
                                        <List className="input-icon" size={20} />
                                        <select
                                            id="userType"
                                            value={userType}
                                            onChange={(e) => setUserType(e.target.value)}
                                        >
                                            {userTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>Manter-me conectado</span>
                                    </label>
                                    <a href="#" className="forgot-password">Esqueci minha senha?</a>
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="submit-error">{errors.submit}</div>
                                )}

                                {/* Submit Button */}
                                <button type="submit" className="login-button" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            Entrar
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>

                                {/* Registration Link */}
                                <div className="register-link">
                                    Não tem uma conta? <Link to="/painel/register">Cadastre-se aqui</Link>
                                </div>
                            </form>

                            {/* Biblical Quote */}
                            <div className="biblical-quote">
                                <p>"Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei."</p>
                                <span>– Mateus 11:28</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainelLogin;
