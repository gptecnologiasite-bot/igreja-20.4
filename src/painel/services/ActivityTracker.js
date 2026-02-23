// Activity Tracker Service using localStorage only

class ActivityTracker {
    constructor() {
        this.storageKey = 'admac_activity_logs';
        this.sessionsKey = 'admac_active_sessions';
        this.pendingSyncKey = 'admac_pending_sync';
        this.initializeStorage();
    }

    // Initialize storage (local only)
    async initializeStorage() {
        return false;
    }

    async getLocationData() {
        await new Promise(resolve => setTimeout(resolve, 100));

        const locations = [
            { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', district: 'Centro' },
            { country: 'Brasil', state: 'São Paulo', city: 'Campinas', district: 'Cambuí' },
            { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', district: 'Copacabana' },
            { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', district: 'Savassi' },
            { country: 'Brasil', state: 'Bahia', city: 'Salvador', district: 'Pelourinho' },
            { country: 'Portugal', state: 'Lisboa', city: 'Lisboa', district: 'Baixa' },
            { country: 'Estados Unidos', state: 'California', city: 'Los Angeles', district: 'Downtown' }
        ];

        return locations[Math.floor(Math.random() * locations.length)];
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';

        return {
            browser,
            platform: navigator.platform,
            language: navigator.language
        };
    }

    async trackLogin(userData) {
        const location = await this.getLocationData();
        const browserInfo = this.getBrowserInfo();
        
        const loginEvent = {
            id: this.generateId(),
            type: 'login',
            user: {
                name: userData.name || 'Unknown',
                email: userData.email,
                userType: userData.userType || 'member'
            },
            location,
            browserInfo,
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };

        await this.saveActivityLog(loginEvent);
        await this.addActiveSession(loginEvent);

        return loginEvent;
    }

    async saveActivityLog(event) {
        this.saveToLocalStorage(event);
    }

    saveToLocalStorage(event) {
        const logs = this.getActivityLogsFromLocalStorage();
        logs.push(event);

        if (logs.length > 1000) {
            logs.shift();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(logs));
    }

    getActivityLogsFromLocalStorage() {
        const logs = localStorage.getItem(this.storageKey);
        return logs ? JSON.parse(logs) : [];
    }

    async getActivityLogs() {
        return this.getActivityLogsFromLocalStorage();
    }

    async getLogsByType(type) {
        const logs = await this.getActivityLogs();
        return logs.filter(log => log.type === type);
    }

    async addActiveSession(loginEvent) {
        const sessionData = {
            sessionId: loginEvent.sessionId,
            user: loginEvent.user,
            location: loginEvent.location,
            browserInfo: loginEvent.browserInfo,
            loginTime: loginEvent.timestamp,
            lastActivity: loginEvent.timestamp
        };

        const sessions = this.getActiveSessionsFromLocalStorage();
        sessions.push(sessionData);
        localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
    }

    getActiveSessionsFromLocalStorage() {
        const sessions = localStorage.getItem(this.sessionsKey);
        return sessions ? JSON.parse(sessions) : [];
    }

    async getActiveSessions() {
        return this.getActiveSessionsFromLocalStorage();
    }

    async getStats(period = 'today') {
        const logs = await this.getActivityLogs();
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0);
        }

        const periodLogs = logs.filter(log => new Date(log.timestamp) >= startDate);
        const loginLogs = periodLogs.filter(log => log.type === 'login');

        const uniqueUsers = new Set(loginLogs.map(log => log.user.email));
        const uniqueLocations = new Set(
            loginLogs.map(log => `${log.location.city}, ${log.location.state}`)
        );

        const sessions = await this.getActiveSessions();

        return {
            totalAccess: loginLogs.length,
            uniqueUsers: uniqueUsers.size,
            uniqueLocations: uniqueLocations.size,
            activeSessions: sessions.length
        };
    }

    async getLocationBreakdown() {
        const logs = await this.getLogsByType('login');
        const locationMap = {};

        logs.forEach(log => {
            const key = `${log.location.city}, ${log.location.state}, ${log.location.country}`;
            if (!locationMap[key]) {
                locationMap[key] = {
                    country: log.location.country,
                    state: log.location.state,
                    city: log.location.city,
                    district: log.location.district,
                    count: 0
                };
            }
            locationMap[key].count++;
        });

        return Object.values(locationMap).sort((a, b) => b.count - a.count);
    }

    async getAccessTimeline(period = 'week') {
        const logs = await this.getLogsByType('login');
        const now = new Date();
        let startDate;
        let groupBy;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                groupBy = 'hour';
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupBy = 'day';
                break;
            default:
                startDate = new Date(0);
                groupBy = 'day';
        }

        const periodLogs = logs.filter(log => new Date(log.timestamp) >= startDate);
        const timeline = {};

        periodLogs.forEach(log => {
            const date = new Date(log.timestamp);
            let key;

            if (groupBy === 'hour') {
                key = `${date.getHours()}:00`;
            } else {
                key = `${date.getDate()}/${date.getMonth() + 1}`;
            }

            timeline[key] = (timeline[key] || 0) + 1;
        });

        return timeline;
    }

    addToPendingSync(event) {
        const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
        pending.push(event);
        localStorage.setItem(this.pendingSyncKey, JSON.stringify(pending));
    }

    async syncPendingData() {
        const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
        if (pending.length === 0) return;
        localStorage.removeItem(this.pendingSyncKey);
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.sessionsKey);
        localStorage.removeItem(this.pendingSyncKey);
    }
}

const activityTracker = new ActivityTracker();
export default activityTracker;
