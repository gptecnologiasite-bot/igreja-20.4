import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout limpo para o painel administrativo — sem Header/Footer público
const AdminLayout = () => {
    return <Outlet />;
};

export default AdminLayout;
