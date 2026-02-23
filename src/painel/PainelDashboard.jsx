import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, User, Menu, Home, Settings, FileEdit,
    Users, Calendar, FileText, DollarSign, TrendingUp,
    TrendingDown, Clipboard, Heart, BookOpen, BarChart3, Globe
} from 'lucide-react';
import './PainelDashboard.css';

const PainelDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const userType = user.userType || 'admin'; // Fallback to admin if not set (legacy users)

    // Get real stats
    const [stats, setStats] = React.useState({
        userCount: 0,
        contentCount: 0
    });

    React.useEffect(() => {
        const loadData = () => {
            const users = JSON.parse(localStorage.getItem('admac_users') || '[]');
            setStats(prev => ({ ...prev, userCount: users.length }));
            setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

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
                { icon: Settings, label: 'Configurações', path: '/painel/settings' },
                { icon: Globe, label: 'Configurações Site', path: '/painel/global-settings' }
            ],
            widgets: [
                { title: 'Total de Usuários', value: stats.userCount.toString(), icon: Users, color: '#4a90e2' },
                { title: 'Visitas Hoje', value: '456', icon: TrendingUp, color: '#50c878' },
                { title: 'Conteúdos', value: '89', icon: FileEdit, color: '#ffd700' }
            ],
            actions: [
                { title: 'Gerenciar Conteúdo', desc: 'Edite o site da igreja', icon: FileEdit, path: '/painel/content' },
                { title: 'Configurações do Site', desc: 'Editar Cabeçalho e Rodapé', icon: Globe, path: '/painel/global-settings' },
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        },
        pastor: {
            label: 'Pastor',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Membros', path: '/painel/users' },
                { icon: FileEdit, label: 'Conteúdo', path: '/painel/content' }
            ],
            widgets: [
                { title: 'Novos Membros (Mês)', value: '12', icon: User, color: '#50c878' },
                { title: 'Atendimentos', value: '5', icon: Heart, color: '#ff6b6b' }
            ],
            actions: [
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        },
        lider: {
            label: 'Líder',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Membros', path: '/painel/users' }
            ],
            widgets: [
                { title: 'Membros Ativos', value: '24', icon: Users, color: '#4a90e2' }
            ],
            actions: [
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        },
        secretario: {
            label: 'Secretaria',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Membros', path: '/painel/users' },
                { icon: FileEdit, label: 'Conteúdo', path: '/painel/content' }
            ],
            widgets: [
                { title: 'Aniversariantes', value: '8', sub: 'Neste mês', icon: Calendar, color: '#ff6b6b' }
            ],
            actions: [
                { title: 'Gerenciar Usuários', desc: 'Cadastros e edits', icon: Users, path: '/painel/users' },
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        },
        tesoureiro: {
            label: 'Tesouraria',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' },
                { icon: Users, label: 'Membros', path: '/painel/users' }
            ],
            widgets: [
                { title: 'Saldo Atual', value: 'R$ 35.800', icon: DollarSign, color: '#ffd700' }
            ],
            actions: [
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        },
        membro: {
            label: 'Membro',
            menu: [
                { icon: Home, label: 'Dashboard', path: '/painel/dashboard' }
            ],
            widgets: [
                { title: 'Versículo do Dia', value: 'Salmos 23:1', sub: 'O Senhor é o meu pastor...', icon: BookOpen, color: '#fff' }
            ],
            actions: [
                { title: 'Meus Dados', desc: 'Atualizar perfil', icon: Settings, path: '/painel/settings' }
            ]
        }
    };

    // Safe fallback if userType is somehow invalid
    const currentRole = roleConfig[userType] || roleConfig.admin;

    // Fix active state logic
    const currentPath = window.location.pathname;

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
                            className={`menu-item ${currentPath === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
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
                        <div className="header-breadcrumbs">
                            <span>Painel</span>
                            <span className="separator">/</span>
                            <span className="current">Dashboard</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-profile-summary">
                            <div className="user-text">
                                <span className="user-name">{user.name || 'Usuário'}</span>
                                <span className="user-role">{currentRole.label}</span>
                            </div>
                            <div className="user-avatar-small">
                                {user.photo ? (
                                    <img src={user.photo} alt={user.name} />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                        </div>
                        <button className="logout-btn-minimal" onClick={handleLogout} title="Sair">
                            <LogOut size={20} />
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

                    {/* Dynamic Quick Actions */}
                    <div className="dashboard-section">
                        <h3>Acesso Rápido</h3>
                        <div className="dashboard-actions">
                            {currentRole.actions.map((action, index) => (
                                <div key={index} className="action-card" onClick={() => navigate(action.path)}>
                                    <action.icon size={32} />
                                    <h3>{action.title}</h3>
                                    <p>{action.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainelDashboard;
