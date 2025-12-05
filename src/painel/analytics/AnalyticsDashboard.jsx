import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import activityTracker from '../services/ActivityTracker';
import StatsCards from './components/StatsCards';
import AccessChart from './components/AccessChart';
import LocationTable from './components/LocationTable';
import ActiveUsersWidget from './components/ActiveUsersWidget';
import AnalyticsDebug from '../services/AnalyticsDebug';
import '../../css/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
    const [period, setPeriod] = useState('today');
    const [stats, setStats] = useState({
        totalAccess: 0,
        uniqueUsers: 0,
        uniqueLocations: 0,
        activeSessions: 0
    });
    const [previousStats, setPreviousStats] = useState(null);
    const [timeline, setTimeline] = useState({});
    const [locations, setLocations] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Load data
    const loadData = () => {
        console.log('📊 Loading analytics data...');

        // Check if there's any data, if not, generate mock data
        const logs = activityTracker.getActivityLogs();
        console.log(`Found ${logs.length} activity logs`);

        if (logs.length === 0) {
            console.log('⚠️ No data found, generating mock data...');
            generateInitialMockData();
            // Reload data after generation
            const newLogs = activityTracker.getActivityLogs();
            console.log(`✅ Generated ${newLogs.length} new logs`);
        }

        // Get current period stats
        const currentStats = activityTracker.getStats(period);
        console.log('Current stats:', currentStats);
        setStats(currentStats);

        // Get previous period stats for comparison
        const prevPeriod = period === 'today' ? 'yesterday' :
            period === 'week' ? 'lastWeek' : 'lastMonth';
        const prevStats = activityTracker.getStats(prevPeriod);
        setPreviousStats(prevStats);

        // Get timeline data
        const timelineData = activityTracker.getAccessTimeline(period);
        console.log('Timeline data:', timelineData);
        setTimeline(timelineData);

        // Get location breakdown
        const locationData = activityTracker.getLocationBreakdown();
        console.log(`Found ${locationData.length} locations`);
        setLocations(locationData);

        // Get active sessions
        const sessions = activityTracker.getActiveSessions();
        console.log(`Found ${sessions.length} active sessions`);
        setActiveSessions(sessions);

        setLastUpdate(new Date());
        console.log('✅ Analytics data loaded successfully!');
    };

    // Generate initial mock data
    const generateInitialMockData = () => {
        const users = [
            { name: 'João Silva', email: 'joao@admac.com', userType: 'admin' },
            { name: 'Maria Santos', email: 'maria@admac.com', userType: 'pastor' },
            { name: 'Pedro Oliveira', email: 'pedro@admac.com', userType: 'lider' },
            { name: 'Ana Costa', email: 'ana@admac.com', userType: 'secretario' },
            { name: 'Carlos Souza', email: 'carlos@admac.com', userType: 'tesoureiro' },
            { name: 'Lucia Ferreira', email: 'lucia@admac.com', userType: 'membro' }
        ];

        const locations = [
            { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', district: 'Centro' },
            { country: 'Brasil', state: 'São Paulo', city: 'Campinas', district: 'Cambuí' },
            { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', district: 'Copacabana' },
            { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', district: 'Savassi' },
            { country: 'Brasil', state: 'Bahia', city: 'Salvador', district: 'Pelourinho' },
            { country: 'Portugal', state: 'Lisboa', city: 'Lisboa', district: 'Baixa' }
        ];

        const now = new Date();
        const events = [];

        // Generate events for the past 30 days
        for (let day = 0; day < 30; day++) {
            const loginsPerDay = Math.floor(Math.random() * 13) + 3;

            for (let i = 0; i < loginsPerDay; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const location = locations[Math.floor(Math.random() * locations.length)];

                const hour = Math.floor(Math.random() * 14) + 6;
                const minute = Math.floor(Math.random() * 60);

                const eventDate = new Date(now);
                eventDate.setDate(eventDate.getDate() - day);
                eventDate.setHours(hour, minute, 0, 0);

                events.push({
                    id: activityTracker.generateId(),
                    type: 'login',
                    user: {
                        name: user.name,
                        email: user.email,
                        userType: user.userType
                    },
                    location,
                    browserInfo: {
                        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
                        platform: 'Win32',
                        language: 'pt-BR'
                    },
                    timestamp: eventDate.toISOString(),
                    sessionId: activityTracker.generateSessionId()
                });
            }
        }

        // Sort by timestamp
        events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Save to localStorage
        localStorage.setItem('admac_activity_logs', JSON.stringify(events));

        // Generate active sessions
        const activeSessions = [];
        const recentUsers = users.slice(0, 3);

        recentUsers.forEach((user, index) => {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const loginTime = new Date(now.getTime() - (index + 1) * 30 * 60 * 1000);
            const lastActivity = new Date(now.getTime() - index * 5 * 60 * 1000);

            activeSessions.push({
                sessionId: activityTracker.generateSessionId(),
                user: {
                    name: user.name,
                    email: user.email,
                    userType: user.userType
                },
                location,
                browserInfo: {
                    browser: 'Chrome',
                    platform: 'Win32',
                    language: 'pt-BR'
                },
                loginTime: loginTime.toISOString(),
                lastActivity: lastActivity.toISOString()
            });
        });

        localStorage.setItem('admac_active_sessions', JSON.stringify(activeSessions));
        console.log(`✅ Generated ${events.length} login events and ${activeSessions.length} active sessions`);
    };

    // Load data on mount and when period changes
    useEffect(() => {
        loadData();
    }, [period]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 30000);

        return () => clearInterval(interval);
    }, [period]);

    // Export data to CSV
    const exportData = () => {
        const logs = activityTracker.getActivityLogs();
        const csv = [
            ['Timestamp', 'Type', 'User', 'Email', 'Country', 'State', 'City', 'District'],
            ...logs.map(log => [
                log.timestamp,
                log.type,
                log.user?.name || '',
                log.user?.email || '',
                log.location?.country || '',
                log.location?.state || '',
                log.location?.city || '',
                log.location?.district || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admac-analytics-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>📊 Analytics & Monitoramento</h1>
                    <p>Acompanhe os acessos e atividades do painel administrativo</p>
                </div>

                <div className="header-actions">
                    <button className="refresh-btn" onClick={loadData}>
                        <RefreshCw size={18} />
                        Atualizar
                    </button>
                    <button className="export-btn" onClick={exportData}>
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Period Filter */}
            <div className="period-filter">
                <Calendar size={20} />
                <div className="period-buttons">
                    <button
                        className={period === 'today' ? 'active' : ''}
                        onClick={() => setPeriod('today')}
                    >
                        Hoje
                    </button>
                    <button
                        className={period === 'week' ? 'active' : ''}
                        onClick={() => setPeriod('week')}
                    >
                        Última Semana
                    </button>
                    <button
                        className={period === 'month' ? 'active' : ''}
                        onClick={() => setPeriod('month')}
                    >
                        Último Mês
                    </button>
                </div>
                <span className="last-update">
                    Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
                </span>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} previousStats={previousStats} />

            {/* Main Content Grid */}
            <div className="analytics-grid">
                {/* Access Chart */}
                <div className="analytics-section chart-section">
                    <AccessChart timeline={timeline} period={period} />
                </div>

                {/* Active Users Widget */}
                <div className="analytics-section users-section">
                    <ActiveUsersWidget sessions={activeSessions} />
                </div>

                {/* Location Table */}
                <div className="analytics-section location-section">
                    <LocationTable locations={locations} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
