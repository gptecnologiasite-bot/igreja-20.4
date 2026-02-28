import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Music, Heart, Settings, LogOut, Menu, X, Home, MessageSquare, Camera, BarChart3, FileText } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        loadUser();
        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/painel/dashboard' },
        { icon: Users, label: 'Usuários', path: '/painel/users' },
        { icon: BookOpen, label: 'Conteúdo', path: '/painel/content' },
        { icon: Heart, label: 'Ministérios', path: '/painel/content/ministries' },
        { icon: Camera, label: 'Vídeos', path: '/painel/content/videos' },
        { icon: MessageSquare, label: 'WhatsApp', path: '/painel/content/whatsapp' },
        { icon: FileText, label: 'Páginas', path: '/painel/content/pages' },
        { icon: BarChart3, label: 'Analytics', path: '/painel/analytics' },
        { icon: Home, label: 'Site Principal', path: '/' },
    ];

    const adminItems = [
        { icon: Settings, label: 'Configurações', path: '/painel/settings' },
        { icon: LogOut, label: 'Sair', path: '/logout', action: 'logout' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('currentSessionId');
        navigate('/painel/login');
    };

    const getUserTypeLabel = (type) => {
        const types = {
            admin: 'Administrador',
            pastor: 'Pastor',
            lider: 'Líder',
            secretario: 'Secretário',
            tesoureiro: 'Tesoureiro',
            membro: 'Membro'
        };
        return types[type] || 'Usuário';
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">A</div>
                        <span className="logo-text">ADMAC<span>Painel</span></span>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="section-title">Menu Principal</span>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || 
                                           (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="nav-section">
                        <span className="section-title">Administração</span>
                        {adminItems.map((item) => (
                            item.action === 'logout' ? (
                                <button
                                    key={item.path}
                                    onClick={handleLogout}
                                    className="nav-link"
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            ) : (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path || location.pathname.startsWith(item.path) ? 'active' : ''}`}
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.photo ? (
                                <img src={user.photo} alt={user.name} />
                            ) : (
                                <Users size={20} />
                            )}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Usuário'}</span>
                            <span className="user-role">{getUserTypeLabel(user?.userType || 'membro')}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
