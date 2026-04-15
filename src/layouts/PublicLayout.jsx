import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSiteData } from '../context/SiteContext';

const PublicLayout = () => {
    const { footerData, siteStatus, loading } = useSiteData();

    // Link do WhatsApp vindo dos dados globais
    const whatsappLink = footerData?.social?.whatsapp || 'https://wa.me/5561993241084';
    
    // Verificação de Manutenção (simplificada via SiteContext)
    const isMaintenance = siteStatus?.maintenance?.active === true;

    if (isMaintenance && !loading) {
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
                {whatsappLink && (
                    <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="whatsapp-float-btn"
                        title="Fale conosco no WhatsApp"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
                    </a>
                )}
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
            {whatsappLink && (
                <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="whatsapp-float-btn"
                    title="Fale conosco no WhatsApp"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
                </a>
            )}
        </>
    );
};

export default PublicLayout;
