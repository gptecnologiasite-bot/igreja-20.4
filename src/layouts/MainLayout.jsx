import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/Header'; // Reusing existing header for now to avoid break
import './MainLayout.css';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="main-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="layout-content">
                <header className="layout-header">
                    {/* Simple navbar toggle for mobile */}
                    <button className="mobile-toggle" onClick={toggleSidebar}>
                        <span className="sr-only">Toggle Menu</span>
                        <div className="hamburger"></div>
                    </button>
                </header>

                <main className="page-container">
                    <Outlet />
                </main>

                <footer className="layout-footer">
                    <p>© 2024 ADMAC - Assembleia de Deus Ministério Além do Cosmos. Todos os direitos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
