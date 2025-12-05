import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bell, Lock, Palette, Globe } from 'lucide-react';
import './Settings.css';

const SettingsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-button" onClick={() => navigate('/painel/dashboard')}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <h1>Configurações</h1>
            </div>

            <div className="settings-content">
                <div className="settings-info-card">
                    <Settings size={32} />
                    <div>
                        <h2>Página em Desenvolvimento</h2>
                        <p>As configurações do sistema estarão disponíveis em breve.</p>
                    </div>
                </div>

                <div className="settings-grid">
                    <div className="setting-card">
                        <div className="setting-icon">
                            <Bell size={24} />
                        </div>
                        <h3>Notificações</h3>
                        <p>Configure alertas e notificações do sistema</p>
                        <span className="coming-soon">Em breve</span>
                    </div>

                    <div className="setting-card">
                        <div className="setting-icon">
                            <Lock size={24} />
                        </div>
                        <h3>Segurança</h3>
                        <p>Gerencie senhas e permissões de acesso</p>
                        <span className="coming-soon">Em breve</span>
                    </div>

                    <div className="setting-card">
                        <div className="setting-icon">
                            <Palette size={24} />
                        </div>
                        <h3>Aparência</h3>
                        <p>Personalize cores e tema do painel</p>
                        <span className="coming-soon">Em breve</span>
                    </div>

                    <div className="setting-card">
                        <div className="setting-icon">
                            <Globe size={24} />
                        </div>
                        <h3>Site Público</h3>
                        <p>Configurações gerais do site da igreja</p>
                        <span className="coming-soon">Em breve</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
