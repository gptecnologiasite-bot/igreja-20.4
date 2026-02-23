import React from 'react';
import { LayoutDashboard, Users, Calendar, TrendingUp, Bell, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const stats = [
        { label: 'Membros Ativos', value: '1,280', change: '+12%', icon: Users, color: '#3b82f6' },
        { label: 'Visitantes (Mês)', value: '85', change: '+5%', icon: TrendingUp, color: '#10b981' },
        { label: 'Eventos Próximos', value: '12', change: 'Estável', icon: Calendar, color: '#f59e0b' },
        { label: 'Novos Projetos', value: '4', change: '+2', icon: LayoutDashboard, color: '#8b5cf6' },
    ];

    const recentActivities = [
        { action: 'Novo membro cadastrado', user: 'Ana Paula', time: '2 horas atrás', status: 'success' },
        { action: 'Evento "Culto Rosa" atualizado', user: 'Admin', time: '4 horas atrás', status: 'info' },
        { action: 'Galeria de fotos atualizada', user: 'Mídia', time: 'Ontem', status: 'success' },
        { action: 'Backup do sistema concluído', user: 'Sistema', time: 'Ontem', status: 'neutral' },
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Olá, Administrador</h1>
                    <p>Bem-vindo ao painel de gestão da ADMAC. Aqui está o resumo de hoje.</p>
                </div>
                <button className="notification-btn">
                    <Bell size={20} />
                    <span className="badge">3</span>
                </button>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-group">
                                <span className="stat-value">{stat.value}</span>
                                <span className={`stat-change ${stat.change.startsWith('+') ? 'up' : ''}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card main-card">
                    <div className="card-header">
                        <h3>Visão Geral Trimestral</h3>
                        <button className="card-action">Ver Detalhes</button>
                    </div>
                    <div className="chart-placeholder">
                        {/* Legend for a mock chart */}
                        <div className="mock-chart">
                            {[60, 45, 75, 50, 90, 65, 80].map((h, i) => (
                                <div key={i} className="chart-bar" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card side-card">
                    <div className="card-header">
                        <h3>Atividades Recentes</h3>
                        <Clock size={16} />
                    </div>
                    <div className="activity-list">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className={`activity-dot ${activity.status}`}></div>
                                <div className="activity-content">
                                    <p className="activity-action">{activity.action}</p>
                                    <div className="activity-meta">
                                        <span>{activity.user}</span>
                                        <span className="separator">•</span>
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
