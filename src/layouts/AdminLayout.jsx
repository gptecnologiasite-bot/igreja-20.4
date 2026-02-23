import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="admin-content">
                <header className="admin-header">
                    <button className="mobile-toggle" onClick={toggleSidebar}>
                        <div className="hamburger"></div>
                    </button>
                </header>

                <main className="admin-page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
