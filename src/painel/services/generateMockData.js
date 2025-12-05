// Mock Data Generator for Analytics Testing
// This script generates sample activity data for testing the analytics dashboard

import activityTracker from './ActivityTracker';

const generateMockData = () => {
    console.log('🔄 Generating mock analytics data...');

    // Sample users
    const users = [
        { name: 'João Silva', email: 'joao@admac.com', userType: 'admin' },
        { name: 'Maria Santos', email: 'maria@admac.com', userType: 'pastor' },
        { name: 'Pedro Oliveira', email: 'pedro@admac.com', userType: 'lider' },
        { name: 'Ana Costa', email: 'ana@admac.com', userType: 'secretario' },
        { name: 'Carlos Souza', email: 'carlos@admac.com', userType: 'tesoureiro' },
        { name: 'Lucia Ferreira', email: 'lucia@admac.com', userType: 'membro' }
    ];

    // Sample locations
    const locations = [
        { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', district: 'Centro' },
        { country: 'Brasil', state: 'São Paulo', city: 'Campinas', district: 'Cambuí' },
        { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', district: 'Copacabana' },
        { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', district: 'Savassi' },
        { country: 'Brasil', state: 'Bahia', city: 'Salvador', district: 'Pelourinho' },
        { country: 'Portugal', state: 'Lisboa', city: 'Lisboa', district: 'Baixa' }
    ];

    // Generate login events for the past 30 days
    const now = new Date();
    const eventsGenerated = [];

    for (let day = 0; day < 30; day++) {
        // Random number of logins per day (3-15)
        const loginsPerDay = Math.floor(Math.random() * 13) + 3;

        for (let i = 0; i < loginsPerDay; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            
            // Random time during the day
            const hour = Math.floor(Math.random() * 14) + 6; // 6am to 8pm
            const minute = Math.floor(Math.random() * 60);
            
            const eventDate = new Date(now);
            eventDate.setDate(eventDate.getDate() - day);
            eventDate.setHours(hour, minute, 0, 0);

            const loginEvent = {
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
            };

            eventsGenerated.push(loginEvent);
        }
    }

    // Sort by timestamp (oldest first)
    eventsGenerated.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Save to localStorage
    localStorage.setItem('admac_activity_logs', JSON.stringify(eventsGenerated));

    // Generate some active sessions (last 2 hours)
    const activeSessions = [];
    const recentUsers = users.slice(0, 3); // 3 active users

    recentUsers.forEach((user, index) => {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const loginTime = new Date(now.getTime() - (index + 1) * 30 * 60 * 1000); // Stagger logins
        const lastActivity = new Date(now.getTime() - index * 5 * 60 * 1000); // Recent activity

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

    console.log(`✅ Generated ${eventsGenerated.length} login events`);
    console.log(`✅ Generated ${activeSessions.length} active sessions`);
    console.log('🎉 Mock data generation complete!');

    return {
        events: eventsGenerated.length,
        sessions: activeSessions.length
    };
};

export default generateMockData;
