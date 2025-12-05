import React from 'react';
import { Activity, Clock, MapPin } from 'lucide-react';

const ActiveUsersWidget = ({ sessions }) => {
    // Calculate session duration
    const getSessionDuration = (loginTime, lastActivity) => {
        const start = new Date(loginTime);
        const end = new Date(lastActivity);
        const diff = Math.floor((end - start) / 1000 / 60); // minutes

        if (diff < 1) return 'Agora';
        if (diff < 60) return `${diff}m`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m`;
    };

    // Get time since last activity
    const getTimeSinceActivity = (lastActivity) => {
        const now = new Date();
        const last = new Date(lastActivity);
        const diff = Math.floor((now - last) / 1000 / 60); // minutes

        if (diff < 1) return 'Ativo agora';
        if (diff < 60) return `${diff}m atrás`;
        const hours = Math.floor(diff / 60);
        return `${hours}h atrás`;
    };

    return (
        <div className="active-users-widget">
            <div className="widget-header">
                <Activity size={24} />
                <h3>Usuários Ativos</h3>
                <span className="active-count">{sessions.length}</span>
            </div>

            <div className="users-list">
                {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                        <div key={index} className="user-session-card">
                            <div className="user-avatar">
                                {session.user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="user-info">
                                <div className="user-name">{session.user.name}</div>
                                <div className="user-email">{session.user.email}</div>

                                <div className="session-details">
                                    <div className="detail-item">
                                        <Clock size={12} />
                                        <span>
                                            {getSessionDuration(session.loginTime, session.lastActivity)}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <MapPin size={12} />
                                        <span>
                                            {session.location.city}, {session.location.state}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-status">
                                <div className="status-indicator active" />
                                <span className="status-text">
                                    {getTimeSinceActivity(session.lastActivity)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-active-users">
                        <Activity size={48} />
                        <p>Nenhum usuário ativo no momento</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveUsersWidget;
