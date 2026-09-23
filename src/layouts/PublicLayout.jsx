import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotificationBell from '../components/NotificationBell';
import { useSiteData } from '../context/SiteContext';
import { supabase } from '../lib/supabase';
import { parseSafeJson } from '../lib/dbUtils';

// Mapeia a rota pública para a chave em site_settings
// (mesma lógica do painel: pageToMinistry + `ministry_${id}`)
const ROUTE_KEYS = {
  '/': 'home',
  '/mulheres': 'ministry_mulheres',
  '/homens': 'ministry_homens',
  '/jovens': 'ministry_jovens',
  '/kids': 'ministry_kids',
  '/edb': 'ministry_ebd',
  '/social': 'ministry_social',
  '/louvor': 'ministry_louvor',
  '/lares': 'ministry_lares',
  '/revista': 'ministry_revista',
  '/missoes': 'ministry_missoes',
  '/retiro': 'ministry_retiro',
  '/sobre': 'ministry_sobre',
  '/midia': 'ministry_midia',
  '/intercessao': 'ministry_intercessao',
  '/casais': 'ministry_casais',
  '/contato': 'ministry_contact',
};

const PublicLayout = () => {
    const { footerData, siteStatus, loading } = useSiteData();
    const location = useLocation();
    // Cache por chave: só grava quando a rota tem key correspondente
    const [activeByKey, setActiveByKey] = useState({});

    // Link do WhatsApp vindo dos dados globais
    const whatsappLink = footerData?.social?.whatsapp || 'https://wa.me/5561993241084';

    // Verificação de Manutenção global (site_status) + por página (active)
    const isGlobalMaintenance = siteStatus?.maintenance?.active === true;
    const routeKey = ROUTE_KEYS[location.pathname];

    useEffect(() => {
      if (!routeKey) return;
      let cancelled = false;
      (async () => {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('data')
            .eq('key', routeKey)
            .single();
          if (cancelled) return;
          const settings = parseSafeJson(data?.data);
          // active ausente = página ativa (compatível com dados antigos)
          setActiveByKey(prev => ({ ...prev, [routeKey]: settings?.active !== false }));
        } catch {
          if (!cancelled) setActiveByKey(prev => ({ ...prev, [routeKey]: true }));
        }
      })();
      return () => { cancelled = true; };
    }, [routeKey]);

    // Sem key = rota sem toggle de status; ainda não carregado = assume ativa
    const pageActive = routeKey ? activeByKey[routeKey] !== false : true;
    const isMaintenance = (isGlobalMaintenance && !loading) || pageActive === false;

    if (isMaintenance) {
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
            <NotificationBell />
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
