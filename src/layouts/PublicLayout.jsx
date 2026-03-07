import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';

const PublicLayout = () => {
    const location = useLocation();
    const [isActive, setIsActive] = React.useState(true);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkStatus = async () => {
            setLoading(true);
            try {
                const rawPath = location.pathname === '/' ? 'home' : location.pathname.split('/').filter(Boolean)[0].toLowerCase();

                // Mapeamento simples para chaves de ministério
                const keysMap = {
                    'revista': 'revista',
                    'contato': 'contact',
                    'home': 'home'
                };

                const id = keysMap[rawPath] || rawPath;
                const key = id === 'home' ? 'home' : `ministry_${id}`;

                const { data } = await supabase.from('site_settings').select('data').eq('key', key).single();

                const parsed = parseSafeJson(data?.data);
                if (parsed) {
                    setIsActive(parsed.active !== false);
                } else {
                    setIsActive(true); // Ativo por padrão
                }
            } catch (err) {
                console.error('Error checking page status:', err);
                setIsActive(true);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [location.pathname]);

    const isInactive = !loading && isActive === false;

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
        );
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
