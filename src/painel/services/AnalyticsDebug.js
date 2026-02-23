// Analytics Debug Helper
// Use this in the browser console to debug analytics data

const AnalyticsDebug = {
    // Check if data exists
    checkData() {
        const logs = localStorage.getItem('admac_activity_logs');
        const sessions = localStorage.getItem('admac_active_sessions');
        
        console.log('=== ANALYTICS DATA CHECK ===');
        console.log('Activity Logs:', logs ? JSON.parse(logs).length + ' events' : 'NO DATA');
        console.log('Active Sessions:', sessions ? JSON.parse(sessions).length + ' sessions' : 'NO DATA');
        
        if (logs) {
            const parsedLogs = JSON.parse(logs);
            console.log('Sample log:', parsedLogs[0]);
            console.log('Latest log:', parsedLogs[parsedLogs.length - 1]);
        }
        
        if (sessions) {
            console.log('Sessions:', JSON.parse(sessions));
        }
    },

    // Clear all analytics data
    clearData() {
        localStorage.removeItem('admac_activity_logs');
        localStorage.removeItem('admac_active_sessions');
        console.log('✅ Analytics data cleared!');
    },

    // Generate test data
    generateTestData() {
        const users = [
            { name: 'João Silva', email: 'joao@admac.com', userType: 'admin' },
            { name: 'Maria Santos', email: 'maria@admac.com', userType: 'pastor' },
            { name: 'Pedro Oliveira', email: 'pedro@admac.com', userType: 'lider' }
        ];

        const locations = [
            { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', district: 'Centro' },
            { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', district: 'Copacabana' },
            { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', district: 'Savassi' }
        ];

        const now = new Date();
        const events = [];

        // Generate 50 events
        for (let i = 0; i < 50; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const daysAgo = Math.floor(Math.random() * 7);
            const eventDate = new Date(now);
            eventDate.setDate(eventDate.getDate() - daysAgo);
            eventDate.setHours(Math.floor(Math.random() * 14) + 6);

            events.push({
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'login',
                user,
                location,
                browserInfo: {
                    browser: 'Chrome',
                    platform: 'Win32',
                    language: 'pt-BR'
                },
                timestamp: eventDate.toISOString(),
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
        }

        localStorage.setItem('admac_activity_logs', JSON.stringify(events));

        // Generate active sessions
        const sessions = users.map((user, index) => ({
            sessionId: `session_${Date.now()}_${index}`,
            user,
            location: locations[index],
            browserInfo: { browser: 'Chrome', platform: 'Win32', language: 'pt-BR' },
            loginTime: new Date(now.getTime() - (index + 1) * 30 * 60 * 1000).toISOString(),
            lastActivity: new Date(now.getTime() - index * 5 * 60 * 1000).toISOString()
        }));

        localStorage.setItem('admac_active_sessions', JSON.stringify(sessions));

        console.log(`✅ Generated ${events.length} events and ${sessions.length} sessions!`);
        console.log('Reload the analytics page to see the data.');
    },

    // View current stats
    viewStats() {
        const logs = JSON.parse(localStorage.getItem('admac_activity_logs') || '[]');
        const sessions = JSON.parse(localStorage.getItem('admac_active_sessions') || '[]');
        
        const loginLogs = logs.filter(l => l.type === 'login');
        const uniqueUsers = new Set(loginLogs.map(l => l.user.email));
        const uniqueLocations = new Set(loginLogs.map(l => `${l.location.city}, ${l.location.state}`));

        console.log('=== CURRENT STATS ===');
        console.log('Total Logins:', loginLogs.length);
        console.log('Unique Users:', uniqueUsers.size);
        console.log('Unique Locations:', uniqueLocations.size);
        console.log('Active Sessions:', sessions.length);
    },

    // Check storage status
    async checkStorageStatus() {
        console.log('=== STORAGE STATUS ===');
        console.log('localStorage:', '✅ AVAILABLE');
        const pending = JSON.parse(localStorage.getItem('admac_pending_sync') || '[]');
        console.log('Pending Sync:', pending.length, 'events');
        return { localStorage: true, pendingSync: pending.length };
    },

    // Force sync (noop - local only)
    async sync() {
        console.log('No remote sync. Using localStorage only.');
    },

    // Test connection (noop)
    async testStorage() {
        console.log('No remote connection. Using localStorage only.');
        return false;
    }
};

// Make it available globally
window.AnalyticsDebug = AnalyticsDebug;

console.log('🔧 Analytics Debug Helper loaded!');
console.log('Available commands:');
console.log('  AnalyticsDebug.checkData() - Check if data exists');
console.log('  AnalyticsDebug.generateTestData() - Generate test data');
console.log('  AnalyticsDebug.viewStats() - View current statistics');
console.log('  AnalyticsDebug.clearData() - Clear all data');
console.log('  AnalyticsDebug.checkStorageStatus() - Check localStorage status');

export default AnalyticsDebug;
