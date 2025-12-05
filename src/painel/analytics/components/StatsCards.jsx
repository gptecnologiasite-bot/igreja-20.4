import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCards = ({ stats, previousStats }) => {
    // Calculate percentage change
    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return { value: 0, trend: 'neutral' };
        const change = ((current - previous) / previous) * 100;
        const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
        return { value: Math.abs(change).toFixed(1), trend };
    };

    const cards = [
        {
            title: 'Acessos Hoje',
            value: stats.totalAccess,
            previous: previousStats?.totalAccess || 0,
            icon: '📊',
            color: '#FFD700'
        },
        {
            title: 'Usuários Ativos',
            value: stats.activeSessions,
            previous: previousStats?.activeSessions || 0,
            icon: '👥',
            color: '#4CAF50'
        },
        {
            title: 'Usuários Únicos',
            value: stats.uniqueUsers,
            previous: previousStats?.uniqueUsers || 0,
            icon: '🔑',
            color: '#2196F3'
        },
        {
            title: 'Localizações',
            value: stats.uniqueLocations,
            previous: previousStats?.uniqueLocations || 0,
            icon: '🌍',
            color: '#FF9800'
        }
    ];

    return (
        <div className="stats-cards-grid">
            {cards.map((card, index) => {
                const change = calculateChange(card.value, card.previous);

                return (
                    <div key={index} className="stat-card" style={{ '--card-color': card.color }}>
                        <div className="stat-card-header">
                            <span className="stat-icon">{card.icon}</span>
                            <h3>{card.title}</h3>
                        </div>

                        <div className="stat-card-body">
                            <div className="stat-value">{card.value}</div>

                            {change.value > 0 && (
                                <div className={`stat-change ${change.trend}`}>
                                    {change.trend === 'up' && <TrendingUp size={16} />}
                                    {change.trend === 'down' && <TrendingDown size={16} />}
                                    {change.trend === 'neutral' && <Minus size={16} />}
                                    <span>{change.value}%</span>
                                </div>
                            )}
                        </div>

                        <div className="stat-card-footer">
                            vs. período anterior
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;
