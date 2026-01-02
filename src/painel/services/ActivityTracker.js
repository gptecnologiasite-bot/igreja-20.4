// Activity Tracker Service with Dual Storage (Supabase + localStorage)
// Automatically uses Supabase when available, falls back to localStorage when offline

import { supabase, testSupabaseConnection } from '../../services/supabaseClient';

class ActivityTracker {
    constructor() {
        this.storageKey = 'admac_activity_logs';
        this.sessionsKey = 'admac_active_sessions';
        this.pendingSyncKey = 'admac_pending_sync';
        this.useSupabase = false;
        this.connectionChecked = false;
        this.PREFER_LOCAL = true; // Forçar uso do localStorage por padrão
        
        // Check Supabase availability on initialization
        this.initializeStorage();
    }

    // Initialize and check which storage to use
    // Inicializa e verifica qual armazenamento usar (Supabase ou LocalStorage)
    async initializeStorage() {
        // Se preferir local, nem tenta conectar ao Supabase por enquanto
        if (this.PREFER_LOCAL) {
            this.useSupabase = false;
            this.connectionChecked = true;
            return false;
        }

        // Se a conexão ainda não foi verificada
        if (!this.connectionChecked) {
            // Testa a conexão com o Supabase
            this.useSupabase = await testSupabaseConnection();
            this.connectionChecked = true;
            
            if (this.useSupabase) {
                console.log('✅ Using Supabase for storage');
                console.log('✅ Usando Supabase para armazenamento');
                // Try to sync any pending data from localStorage
                // Tenta sincronizar quaisquer dados pendentes do localStorage
                await this.syncPendingData();
            } else {
                console.log('⚠️ Supabase unavailable, using localStorage');
                console.log('⚠️ Supabase indisponível, usando localStorage');
            }
        }
        return this.useSupabase;
    }

    // Get simulated location data
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

    // Get browser and device info
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

    // Track login event
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

        // Try to save to both storages
        await this.saveActivityLog(loginEvent);
        await this.addActiveSession(loginEvent);

        return loginEvent;
    }

    // Save activity log (tries Supabase first, falls back to localStorage)
    // Salva log de atividade (tenta Supabase primeiro, usa localStorage como backup)
    async saveActivityLog(event) {
        // Verifica qual storage está disponível
        const useSupabase = await this.initializeStorage();

        if (useSupabase) {
            try {
                // Tenta inserir no Supabase
                const { error } = await supabase.from('activity_logs').insert([{
                    id: event.id,
                    type: event.type,
                    user_name: event.user?.name,
                    user_email: event.user?.email,
                    user_type: event.user?.userType,
                    country: event.location?.country,
                    state: event.location?.state,
                    city: event.location?.city,
                    district: event.location?.district,
                    browser: event.browserInfo?.browser,
                    platform: event.browserInfo?.platform,
                    language: event.browserInfo?.language,
                    timestamp: event.timestamp,
                    session_id: event.sessionId
                }]);

                if (error) throw error;
                
                // Also save to localStorage as cache
                // Também salva no localStorage como cache para performance
                this.saveToLocalStorage(event);
                return true;
            } catch (error) {
                console.error('Error saving to Supabase, falling back to localStorage:', error);
                // Em caso de erro, muda para modo offline e salva no localStorage
                this.useSupabase = false;
                this.saveToLocalStorage(event);
                // Adiciona à fila de sincronização pendente
                this.addToPendingSync(event);
            }
        } else {
            // Se Supabase já estava offline, salva direto no localStorage
            this.saveToLocalStorage(event);
            this.addToPendingSync(event);
        }
    }

    // Save to localStorage
    saveToLocalStorage(event) {
        const logs = this.getActivityLogsFromLocalStorage();
        logs.push(event);

        if (logs.length > 1000) {
            logs.shift();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(logs));
    }

    // Get activity logs from localStorage
    getActivityLogsFromLocalStorage() {
        const logs = localStorage.getItem(this.storageKey);
        return logs ? JSON.parse(logs) : [];
    }

    // Get all activity logs (tries Supabase first)
    async getActivityLogs() {
        const useSupabase = await this.initializeStorage();

        if (useSupabase) {
            try {
                const { data, error } = await supabase
                    .from('activity_logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(1000);

                if (error) throw error;

                // Convert Supabase format back to app format
                return data.map(log => ({
                    id: log.id,
                    type: log.type,
                    user: {
                        name: log.user_name,
                        email: log.user_email,
                        userType: log.user_type
                    },
                    location: {
                        country: log.country,
                        state: log.state,
                        city: log.city,
                        district: log.district
                    },
                    browserInfo: {
                        browser: log.browser,
                        platform: log.platform,
                        language: log.language
                    },
                    timestamp: log.timestamp,
                    sessionId: log.session_id
                }));
            } catch (error) {
                console.error('Error fetching from Supabase, using localStorage:', error);
                this.useSupabase = false;
            }
        }

        return this.getActivityLogsFromLocalStorage();
    }

    // Get logs by type
    async getLogsByType(type) {
        const logs = await this.getActivityLogs();
        return logs.filter(log => log.type === type);
    }

    // Add active session
    async addActiveSession(loginEvent) {
        const useSupabase = await this.initializeStorage();

        const sessionData = {
            sessionId: loginEvent.sessionId,
            user: loginEvent.user,
            location: loginEvent.location,
            browserInfo: loginEvent.browserInfo,
            loginTime: loginEvent.timestamp,
            lastActivity: loginEvent.timestamp
        };

        if (useSupabase) {
            try {
                const { error } = await supabase.from('active_sessions').insert([{
                    session_id: sessionData.sessionId,
                    user_name: sessionData.user.name,
                    user_email: sessionData.user.email,
                    user_type: sessionData.user.userType,
                    country: sessionData.location.country,
                    state: sessionData.location.state,
                    city: sessionData.location.city,
                    district: sessionData.location.district,
                    browser: sessionData.browserInfo.browser,
                    platform: sessionData.browserInfo.platform,
                    language: sessionData.browserInfo.language,
                    login_time: sessionData.loginTime,
                    last_activity: sessionData.lastActivity
                }]);

                if (error) throw error;
            } catch (error) {
                console.error('Error saving session to Supabase:', error);
                this.useSupabase = false;
            }
        }

        // Always save to localStorage as well
        const sessions = this.getActiveSessionsFromLocalStorage();
        sessions.push(sessionData);
        localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
    }

    // Get active sessions from localStorage
    getActiveSessionsFromLocalStorage() {
        const sessions = localStorage.getItem(this.sessionsKey);
        return sessions ? JSON.parse(sessions) : [];
    }

    // Get active sessions
    async getActiveSessions() {
        const useSupabase = await this.initializeStorage();

        if (useSupabase) {
            try {
                const { data, error} = await supabase
                    .from('active_sessions')
                    .select('*')
                    .order('last_activity', { ascending: false });

                if (error) throw error;

                return data.map(session => ({
                    sessionId: session.session_id,
                    user: {
                        name: session.user_name,
                        email: session.user_email,
                        userType: session.user_type
                    },
                    location: {
                        country: session.country,
                        state: session.state,
                        city: session.city,
                        district: session.district
                    },
                    browserInfo: {
                        browser: session.browser,
                        platform: session.platform,
                        language: session.language
                    },
                    loginTime: session.login_time,
                    lastActivity: session.last_activity
                }));
            } catch (error) {
                console.error('Error fetching sessions from Supabase:', error);
                this.useSupabase = false;
            }
        }

        return this.getActiveSessionsFromLocalStorage();
    }

    // Get statistics
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

    // Get location breakdown
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

    // Get access timeline
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

    // Add to pending sync queue
    addToPendingSync(event) {
        const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
        pending.push(event);
        localStorage.setItem(this.pendingSyncKey, JSON.stringify(pending));
    }

    // Sync pending data to Supabase
    // Sincroniza dados pendentes (salvos offline) para o Supabase
    async syncPendingData() {
        // Busca eventos pendentes do localStorage
        const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
        
        if (pending.length === 0) return;

        console.log(`🔄 Syncing ${pending.length} pending events to Supabase...`);
        console.log(`🔄 Sincronizando ${pending.length} eventos pendentes para o Supabase...`);

        try {
            // Tenta inserir todos os eventos pendentes de uma vez
            const { error } = await supabase.from('activity_logs').insert(
                pending.map(event => ({
                    id: event.id,
                    type: event.type,
                    user_name: event.user?.name,
                    user_email: event.user?.email,
                    user_type: event.user?.userType,
                    country: event.location?.country,
                    state: event.location?.state,
                    city: event.location?.city,
                    district: event.location?.district,
                    browser: event.browserInfo?.browser,
                    platform: event.browserInfo?.platform,
                    language: event.browserInfo?.language,
                    timestamp: event.timestamp,
                    session_id: event.sessionId
                }))
            );

            if (error) throw error;

            // Clear pending queue
            // Limpa a fila de pendências após sucesso
            localStorage.removeItem(this.pendingSyncKey);
            console.log('✅ Pending data synced successfully!');
            console.log('✅ Dados pendentes sincronizados com sucesso!');
        } catch (error) {
            console.error('Error syncing pending data:', error);
            console.error('Erro ao sincronizar dados pendentes:', error);
        }
    }

    // Generate unique ID
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Clear all data
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.sessionsKey);
        localStorage.removeItem(this.pendingSyncKey);
    }
}

// Export singleton instance
const activityTracker = new ActivityTracker();
export default activityTracker;
