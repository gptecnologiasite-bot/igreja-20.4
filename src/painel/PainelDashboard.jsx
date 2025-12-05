import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, User, Menu, Home, Settings, FileEdit,
    Users, Calendar, FileText, DollarSign, TrendingUp,
    TrendingDown, Clipboard, Heart, BookOpen, BarChart3
} from 'lucide-react';
import './PainelDashboard.css';

const PainelDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = user.userType || 'admin'; // Fallback to admin if not set (legacy users)

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        navigate('/painel/login');
    };

    // Role Configuration
    const roleConfig = {
        admin: {
            label: 'Administrador',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Usuários', path: '/painel/users' },
                { icon: FileEdit, label: 'Conteúdo', path: '/painel/content' },
                { icon: BarChart3, label: 'Analytics', path: '/painel/analytics' },
                { icon: Settings, label: 'Configurações', path: '/painel/settings' }
            ],
            widgets: [
                { title: 'Total de Usuários', value: '1,234', icon: Users, color: '#4a90e2' },
                { title: 'Visitas Hoje', value: '456', icon: TrendingUp, color: '#50c878' },
                { title: 'Conteúdos', value: '89', icon: FileEdit, color: '#ffd700' }
            ]
        },
        pastor: {
            label: 'Pastor',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Membros', path: '/painel/members' },
                { icon: Calendar, label: 'Agenda Pastoral', path: '/painel/schedule' },
                { icon: FileText, label: 'Relatórios', path: '/painel/reports' }
            ],
            widgets: [
                { title: 'Novos Membros (Mês)', value: '12', icon: User, color: '#50c878' },
                { title: 'Atendimentos', value: '5', icon: Heart, color: '#ff6b6b' },
                { title: 'Próximo Evento', value: 'Culto Ceia', sub: 'Domingo, 18h', icon: Calendar, color: '#4a90e2' }
            ]
        },
        lider: {
            label: 'Líder de Ministério',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Meu Ministério', path: '/painel/ministry' },
                { icon: Clipboard, label: 'Escalas', path: '/painel/roster' },
                { icon: Calendar, label: 'Eventos', path: '/painel/events' }
            ],
            widgets: [
                { title: 'Membros Ativos', value: '24', icon: Users, color: '#4a90e2' },
                { title: 'Próxima Escala', value: 'Louvor', sub: 'Quarta-feira', icon: Clipboard, color: '#ffd700' }
            ]
        },
        secretario: {
            label: 'Secretaria',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Cadastro Membros', path: '/painel/members' },
                { icon: FileText, label: 'Atas e Docs', path: '/painel/docs' },
                { icon: Calendar, label: 'Agenda da Igreja', path: '/painel/church-schedule' }
            ],
            widgets: [
                { title: 'Aniversariantes', value: '8', sub: 'Neste mês', icon: Calendar, color: '#ff6b6b' },
                { title: 'Novos Cadastros', value: '3', sub: 'Aguardando Aprovação', icon: User, color: '#ffd700' }
            ]
        },
        tesoureiro: {
            label: 'Tesouraria',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: DollarSign, label: 'Dízimos & Ofertas', path: '/painel/finance/income' },
                { icon: TrendingDown, label: 'Pagamentos', path: '/painel/finance/expenses' },
                { icon: FileText, label: 'Relatórios', path: '/painel/finance/reports' }
            ],
            widgets: [
                { title: 'Entradas (Mês)', value: 'R$ 12.500', icon: TrendingUp, color: '#50c878' },
                { title: 'Saídas (Mês)', value: 'R$ 4.200', icon: TrendingDown, color: '#ff6b6b' },
                { title: 'Saldo Atual', value: 'R$ 35.800', icon: DollarSign, color: '#ffd700' }
            ]
        },
        membro: {
            label: 'Membro',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Clipboard, label: 'Minhas Escalas', path: '/painel/my-roster' },
                { icon: DollarSign, label: 'Meus Dízimos', path: '/painel/my-tithes' }
            ],
            widgets: [
                { title: 'Próximo Culto', value: 'Domingo', sub: '18:00h - Ceia', icon: Calendar, color: '#4a90e2' },
                { title: 'Versículo do Dia', value: 'Salmos 23:1', sub: 'O Senhor é o meu pastor...', icon: BookOpen, color: '#fff' }
            ]
        }
    };

    // Safe fallback if userType is somehow invalid
    const currentRole = roleConfig[userType] || roleConfig.admin;

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <img src="/admac.png" alt="ADMAC Logo" />
                    <h2>ADMAC</h2>
                </div>
                <div className="role-badge">
                    {currentRole.label}
                </div>
                <div className="sidebar-menu">
                    {currentRole.menu.map((item, index) => (
                        <div
                            key={index}
                            className={`menu-item ${index === 0 ? 'active' : ''}`}
                            onClick={() => item.path !== '/painel/dashboard' && navigate(item.path)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="menu-toggle">
                            <Menu size={24} />
                        </button>
                        <h1>Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <User size={20} />
                            <span>{user.name || 'Usuário'}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                            Sair
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="dashboard-content">
                    <div className="welcome-card">
                        <h2>Olá, {user.name?.split(' ')[0] || 'Bem-vindo'}! 👋</h2>
                        <p>Bem-vindo ao Painel {currentRole.label}. Aqui está o resumo de hoje.</p>
                    </div>

                    {/* Dynamic Widgets Grid */}
                    <div className="widgets-grid">
                        {currentRole.widgets.map((widget, index) => (
                            <div key={index} className="widget-card">
                                <div className="widget-icon" style={{ backgroundColor: `${widget.color}20`, color: widget.color }}>
                                    <widget.icon size={24} />
                                </div>
                                <div className="widget-info">
                                    <h3>{widget.value}</h3>
                                    <p>{widget.title}</p>
                                    {widget.sub && <span className="widget-sub">{widget.sub}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions (Example context based) */}
                    <div className="dashboard-section">
                        <h3>Acesso Rápido</h3>
                        <div className="dashboard-actions">
                            {userType === 'admin' ? (
                                <div className="action-card" onClick={() => navigate('/painel/content')}>
                                    <FileEdit size={32} />
                                    <h3>Gerenciar Conteúdo</h3>
                                    <p>Edite o site da igreja</p>
                                </div>
                            ) : null}

                            {/* Generic placeholder actions for demo */}
                            <div className="action-card empty-action">
                                <Settings size={32} />
                                <h3>Meus Dados</h3>
                                <p>Atualizar perfil</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainelDashboard;
