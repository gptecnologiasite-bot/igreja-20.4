import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  User,
  Home,
  Layout,
  Users,
  Music,
  Zap,
  Heart,
  Home as HomeIcon,
  Mountain,
  Monitor,
  BookOpen
} from 'lucide-react';
import '../css/Dashboard.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('admac_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });

  const user = (() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { name: 'Admin', email: 'admin@admac.com' };
  })();

  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admac_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/painel' },
    { icon: FileText, label: 'Gerenciar Páginas', path: '/painel/paginas' },
    { icon: Home, label: 'Gerenciar Home', path: '/painel/home' },
    { icon: Layout, label: 'Gerenciar Rodapé', path: '/painel/footer' },
    
    { icon: Users, label: 'Min. Kids', path: '/painel/kids' },
    { icon: Music, label: 'Min. Louvor', path: '/painel/louvor' },
    { icon: Zap, label: 'Min. Jovens', path: '/painel/jovens' },
    { icon: Heart, label: 'Min. Mulheres', path: '/painel/mulheres' },
    { icon: HomeIcon, label: 'Min. Lares', path: '/painel/lares' },
    { icon: Mountain, label: 'Retiros', path: '/painel/retiro' },
    { icon: Heart, label: 'Ação Social', path: '/painel/social' },
    { icon: Monitor, label: 'Mídia', path: '/painel/midia' },
    { icon: FileText, label: 'Revista', path: '/painel/revista' },

    { icon: Settings, label: 'Configurações', path: '/painel/configuracoes' },
  ];

  return (
    <div className="dashboard-container">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-icon">A</div>
            {isSidebarOpen && <span className="logo-text">ADMAC Painel</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <Search size={20} />
            <input type="text" placeholder="Buscar..." />
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-profile">
              <div className="avatar">
                <User size={20} />
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
