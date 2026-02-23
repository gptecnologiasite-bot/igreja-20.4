import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Music, Heart, Settings, LogOut, Menu, X, Home, MessageSquare, Camera } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/painel' },
        { icon: Users, label: 'Membros', path: '/painel/membros' },
        { icon: BookOpen, label: 'EDB', path: '/edb' },
        { icon: Heart, label: 'Ministérios', path: '/ministerios' },
        { icon: Camera, label: 'Galeria', path: '/painel/galeria' },
        { icon: Home, label: 'Site Principal', path: '/' },
    ];

    const adminItems = [
        { icon: Settings, label: 'Configurações', path: '/painel/configuracoes' },
        { icon: LogOut, label: 'Sair', path: '/logout' },
    ];

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
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="nav-section">
                        <span className="section-title">Administração</span>
                        {adminItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <Users size={20} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">Administrador</span>
                            <span className="user-role">Nível Master</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
