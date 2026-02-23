import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PainelLogin from './PainelLogin';
import PainelRegister from './PainelRegister';
import PainelDashboard from './PainelDashboard';
import ContentManager from './ContentManager';
import MinistriesManager from './managers/MinistriesManager';
import VideosManager from './managers/VideosManager';
import WhatsAppManager from './managers/WhatsAppManager';
import PagesManager from './managers/PagesManager';
import HomeEditor from './managers/HomeEditor';
import UsersManager from './managers/UsersManager';
import GlobalSettingsEditor from './managers/GlobalSettingsEditor';
import SettingsPage from './Settings';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import PageEditor from './managers/PageEditor';

const PainelApp = () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return (
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/painel/dashboard" /> : <PainelLogin />}
            />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/painel/dashboard" /> : <PainelLogin />}
            />
            <Route path="/register" element={<PainelRegister />} />
            <Route
                path="/dashboard"
                element={isAuthenticated ? <PainelDashboard /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content"
                element={isAuthenticated ? <ContentManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/ministries"
                element={isAuthenticated ? <MinistriesManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/pages"
                element={isAuthenticated ? <PagesManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/pages/home"
                element={isAuthenticated ? <HomeEditor /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/pages/:id"
                element={isAuthenticated ? <PageEditor /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/videos"
                element={isAuthenticated ? <VideosManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/content/whatsapp"
                element={isAuthenticated ? <WhatsAppManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/users"
                element={isAuthenticated ? <UsersManager /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/settings"
                element={isAuthenticated ? <SettingsPage /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/global-settings"
                element={isAuthenticated ? <GlobalSettingsEditor /> : <Navigate to="/painel/login" />}
            />
            <Route
                path="/analytics"
                element={isAuthenticated ? <AnalyticsDashboard /> : <Navigate to="/painel/login" />}
            />
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/painel/login" />} />
        </Routes>
    );
};

export default PainelApp;
