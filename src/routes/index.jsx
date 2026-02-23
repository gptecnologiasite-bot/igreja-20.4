import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

// Pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Home = lazy(() => import('../pages/Home'));
const Revista = lazy(() => import('../pages/RevistaAdmac'));
const Login = lazy(() => import('../pages/Login'));
const Mulheres = lazy(() => import('../pages/Mulheres'));
const Homens = lazy(() => import('../pages/Homens'));
const Jovens = lazy(() => import('../pages/JovensPage'));
const Kids = lazy(() => import('../pages/Kids'));
const EDB = lazy(() => import('../pages/EDB'));
const Social = lazy(() => import('../pages/Social'));
const Louvor = lazy(() => import('../pages/Louvor'));
const Lares = lazy(() => import('../pages/Lares'));
const Contact = lazy(() => import('../pages/Contact'));
const Retiro = lazy(() => import('../pages/Retiro'));
const Midia = lazy(() => import('../pages/Midia'));
const Sobre = lazy(() => import('../pages/Sobre'));
const PainelApp = lazy(() => import('../painel/PainelApp'));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export const routes = [
    // Public Routes (Original look preserved)
    {
        path: '/',
        element: <Suspense fallback={<PageLoader />}><PublicLayout /></Suspense>,
        children: [
            { index: true, element: <Home /> },
            { path: 'mulheres', element: <Mulheres /> },
            { path: 'homens', element: <Homens /> },
            { path: 'jovens', element: <Jovens /> },
            { path: 'kids', element: <Kids /> },
            { path: 'edb', element: <EDB /> },
            { path: 'social', element: <Social /> },
            { path: 'louvor', element: <Louvor /> },
            { path: 'lares', element: <Lares /> },
            { path: 'revista', element: <Revista /> },
            { path: 'retiro', element: <Retiro /> },
            { path: 'midia', element: <Midia /> },
            { path: 'sobre', element: <Sobre /> },
            { path: 'contato', element: <Contact /> },
        ]
    },
    // Admin Routes (New professional look)
    {
        path: '/painel',
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
            { index: true, element: <Dashboard /> },
            { path: '*', element: <PainelApp /> },
        ]
    },
    { path: '/login', element: <Login /> },
    { path: '*', element: <Navigate to="/" replace /> }
];
