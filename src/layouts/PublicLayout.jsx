import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = () => {
    const location = useLocation();
    const [pages, setPages] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/pages')
            .then(r => r.json())
            .then(data => {
                setPages(data.items || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const normalize = (str) => str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const currentPageName = location.pathname === '/' ? 'Home' : location.pathname.split('/').filter(Boolean)[0];
    const currentPage = pages.find(p => normalize(p.name) === normalize(currentPageName));
    const isInactive = currentPage && currentPage.active === false;

    if (loading) return null;

    if (isInactive) {
        return (
            <>
                <Header />
                <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: '#0f1117', color: '#fff' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Página em Manutenção</h1>
                    <p style={{ color: '#7c82a0', maxWidth: '400px' }}>Esta página está sendo atualizada no momento. Por favor, volte mais tarde.</p>
                    <a href="/" style={{ marginTop: '2rem', color: '#6c63ff', textDecoration: 'none', fontWeight: 'bold' }}>← Voltar para a Início</a>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default PublicLayout;
