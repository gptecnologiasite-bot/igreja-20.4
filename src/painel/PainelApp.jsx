import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PainelLogin from './PainelLogin';
import PainelRegister from './PainelRegister';
import PainelDashboard from './PainelDashboard';
import ContentManager from './ContentManager';
import MinistriesManager from './managers/MinistriesManager';
import VideosManager from './managers/VideosManager';

const PainelApp = () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return (
        <Routes>
            <Route path="/" element={<PainelLogin />} />
            <Route path="/login" element={<PainelLogin />} />
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
                path="/content/videos"
                element={isAuthenticated ? <VideosManager /> : <Navigate to="/painel/login" />}
            />
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/painel/login" />} />
        </Routes>
    );
};

export default PainelApp;
