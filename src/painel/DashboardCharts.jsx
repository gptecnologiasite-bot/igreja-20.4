import React from 'react';
import { Users, FileText, Eye, TrendingUp, Activity } from 'lucide-react';

const DashboardCharts = () => {
  const pages = (() => {
    const savedPages = localStorage.getItem('admac_pages');
    return savedPages ? JSON.parse(savedPages) : [];
  })();

  const stats = {
    totalPages: pages.length,
    onlinePages: pages.filter(p => p.status === 'online').length,
    offlinePages: pages.filter(p => p.status === 'offline').length,
    dynamicPages: pages.filter(p => p.type === 'dynamic').length
  };

  const statsCards = [
    { title: 'Total de Páginas', value: stats.totalPages, icon: FileText, color: '#3b82f6', change: `+${stats.dynamicPages} dinâmicas` },
    { title: 'Páginas Online', value: stats.onlinePages, icon: Eye, color: '#10b981', change: `${stats.offlinePages} offline` },
    { title: 'Visitantes', value: '12,458', icon: Users, color: '#8b5cf6', change: '+12.5%' },
    { title: 'Engajamento', value: '68.4%', icon: Activity, color: '#f59e0b', change: '+5.1%' }
  ];

  const recentPages = pages.slice(0, 5);

  return (
    <div className="dashboard-modern">
      <div className="dashboard-modern-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bem-vindo ao painel administrativo da ADMAC</p>
        </div>
      </div>

      <div className="stats-modern-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-modern-card">
            <div className="stat-modern-header">
              <div className="stat-modern-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <span className="stat-modern-change up">
                <TrendingUp size={14} />
                {stat.change}
              </span>
            </div>
            <div className="stat-modern-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="content-modern-grid">
        <div className="modern-card">
          <div className="modern-card-header">
            <h3>Páginas Recentes</h3>
            <a href="/painel/paginas" className="btn-link">Ver Todas</a>
          </div>
          <div className="modern-table">
            <table>
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPages.length > 0 ? (
                  recentPages.map((page, index) => (
                    <tr key={index}>
                      <td>
                        <div className="table-cell-content">
                          <FileText size={16} />
                          <span>{page.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">{page.type === 'dynamic' ? 'Dinâmica' : 'Sistema'}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${page.status}`}>
                          {page.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      Nenhuma página encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modern-card">
          <div className="modern-card-header">
            <h3>Ações Rápidas</h3>
          </div>
          <div className="quick-actions-modern">
            <a href="/painel/paginas" className="action-modern-btn">
              <FileText size={20} />
              <span>Gerenciar Páginas</span>
            </a>
            <a href="/painel/home" className="action-modern-btn">
              <Eye size={20} />
              <span>Editar Home</span>
            </a>
            <a href="/painel/footer" className="action-modern-btn">
              <Activity size={20} />
              <span>Editar Rodapé</span>
            </a>
            <a href="/painel/configuracoes" className="action-modern-btn">
              <Users size={20} />
              <span>Configurações</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
