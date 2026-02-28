import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));

// Pages
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
// Painel administrativo completo (sincroniza pasta pages via serviços)
const PainelApp = lazy(() => import('../painel/painel'));

// Loading element (não exporta componente para evitar alerta do fast refresh)
const pageLoader = (
  <div className="flex items-center justify-center min-h-screen bg-[#121212]">
    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const routes = [
    // Public Routes (Original look preserved)
    {
        path: '/',
        element: <Suspense fallback={pageLoader}><PublicLayout /></Suspense>,
        children: [
            { index: true, element: <Suspense fallback={pageLoader}><Home /></Suspense> },
            { path: 'mulheres', element: <Suspense fallback={pageLoader}><Mulheres /></Suspense> },
            { path: 'homens', element: <Suspense fallback={pageLoader}><Homens /></Suspense> },
            { path: 'jovens', element: <Suspense fallback={pageLoader}><Jovens /></Suspense> },
            { path: 'kids', element: <Suspense fallback={pageLoader}><Kids /></Suspense> },
            { path: 'edb', element: <Suspense fallback={pageLoader}><EDB /></Suspense> },
            { path: 'social', element: <Suspense fallback={pageLoader}><Social /></Suspense> },
            { path: 'louvor', element: <Suspense fallback={pageLoader}><Louvor /></Suspense> },
            { path: 'lares', element: <Suspense fallback={pageLoader}><Lares /></Suspense> },
            { path: 'revista', element: <Suspense fallback={pageLoader}><Revista /></Suspense> },
            { path: 'retiro', element: <Suspense fallback={pageLoader}><Retiro /></Suspense> },
            { path: 'midia', element: <Suspense fallback={pageLoader}><Midia /></Suspense> },
            { path: 'sobre', element: <Suspense fallback={pageLoader}><Sobre /></Suspense> },
            { path: 'contato', element: <Suspense fallback={pageLoader}><Contact /></Suspense> },
        ]
    },
    // Admin Routes
    {
        path: '/painel',
        element: <Suspense fallback={pageLoader}><AdminLayout /></Suspense>,
        children: [
            { index: true, element: <Suspense fallback={pageLoader}><PainelApp /></Suspense> },
            { path: '*', element: <Suspense fallback={pageLoader}><PainelApp /></Suspense> },
        ]
    },
    { path: '/login', element: <Suspense fallback={pageLoader}><Login /></Suspense> },
    { path: '*', element: <Navigate to="/" replace /> }
];
