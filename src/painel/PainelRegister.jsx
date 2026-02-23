import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, Menu, Mail, UserPlus, List, Image as ImageIcon } from 'lucide-react';
import authService from '../services/AuthService';
import ImageUploadField from './components/ImageUploadField';
import './PainelRegister.css';

const PainelRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: '',
        photo: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // User type options for the list selection
    const userTypes = [
        { value: '', label: 'Selecione o tipo de usuário' },
        { value: 'admin', label: 'Administrador' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'lider', label: 'Líder de Ministério' },
        { value: 'secretario', label: 'Secretário' },
        { value: 'tesoureiro', label: 'Tesoureiro' },
        { value: 'membro', label: 'Membro' }
    ];

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation
        if (name === 'email' && value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'E-mail inválido' }));
        } else if (name === 'email') {
            setErrors(prev => ({ ...prev, email: '' }));
        }

        if (name === 'password' && value && !validatePassword(value)) {
            setErrors(prev => ({ ...prev, password: 'Senha deve ter pelo menos 6 caracteres' }));
        } else if (name === 'password') {
            setErrors(prev => ({ ...prev, password: '' }));
        }

        if (name === 'confirmPassword' && value && value !== formData.password) {
            setErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
        } else if (name === 'confirmPassword') {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate all fields
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (!formData.userType) {
            newErrors.userType = 'Selecione o tipo de usuário';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Registrar usuário com AuthService
            const result = await authService.register(
                formData.name,
                formData.email,
                formData.password,
                formData.userType,
                formData.photo
            );

            if (result.success) {
                console.log('✅ Registro bem-sucedido:', result);

                // Redirecionar para login com mensagem de sucesso
                navigate('/painel/login', {
                    state: {
                        registered: true,
                        message: result.message || 'Cadastro realizado com sucesso!'
                    }
                });
            } else {
                setErrors({ submit: 'Erro ao realizar cadastro. Tente novamente.' });
            }

        } catch (error) {
            console.error('Erro no registro:', error);
            setErrors({ submit: error.message || 'Erro ao realizar cadastro. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="painel-register-container">
            {/* Sidebar */}
            <div className="painel-sidebar">
                <div className="sidebar-logo">
                    <img src="/admac.png" alt="ADMAC Logo" />
                    <h2>ADMAC</h2>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item active">
                        <UserPlus size={20} />
                        <span>Cadastro</span>
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
                        <h1>Cadastro de Usuário ADMAC</h1>
                    </div>
                    <div className="header-right"></div>
                </div>

                {/* Content Area */}
                <div className="painel-content">
                    <div className="register-form-wrapper">
                        <div className="register-form-card">
                            {/* Logo in Form */}
                            <div className="form-logo">
                                <img src="/admac.png" alt="ADMAC Logo" />
                            </div>

                            {/* Form Header */}
                            <div className="form-header">
                                <h2>Criar Conta</h2>
                                <p>Preencha os dados abaixo para criar sua conta.</p>
                            </div>

                            {/* Registration Form */}
                            <form onSubmit={handleSubmit} className="register-form">
                                {/* Name Field */}
                                <div className="form-group">
                                    <label htmlFor="name">Nome Completo</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={20} />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Seu nome completo"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={errors.name ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                {/* Email Field */}
                                <div className="form-group">
                                    <label htmlFor="email">E-mail</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={20} />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                {/* User Type Selection */}
                                <div className="form-group">
                                    <label htmlFor="userType">Tipo de Usuário</label>
                                    <div className="input-wrapper">
                                        <List className="input-icon" size={20} />
                                        <select
                                            id="userType"
                                            name="userType"
                                            value={formData.userType}
                                            onChange={handleChange}
                                            className={errors.userType ? 'error' : ''}
                                        >
                                            {userTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.userType && <span className="error-message">{errors.userType}</span>}
                                </div>

                                {/* Photo Field */}
                                <div className="form-group">
                                    <ImageUploadField
                                        label="Foto de Perfil (Opcional)"
                                        value={formData.photo}
                                        onChange={val => setFormData(prev => ({ ...prev, photo: val }))}
                                        placeholder="Suba uma foto ou cole o link"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="form-group">
                                    <label htmlFor="password">Senha</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
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

                                {/* Confirm Password Field */}
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirmar Senha</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={errors.confirmPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label="Toggle confirm password visibility"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="submit-error">{errors.submit}</div>
                                )}

                                {/* Submit Button */}
                                <button type="submit" className="register-button" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Cadastrando...
                                        </>
                                    ) : (
                                        <>
                                            Cadastrar
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="login-link">
                                    Já tem uma conta? <Link to="/painel/login">Fazer login</Link>
                                </div>
                            </form>

                            {/* Biblical Quote */}
                            <div className="biblical-quote">
                                <p>"Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!"</p>
                                <span>– 2 Coríntios 5:17</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainelRegister;
