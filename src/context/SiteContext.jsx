/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseSafeJson, deepMerge } from '../lib/dbUtils';
import { INITIAL_HEADER_DATA, INITIAL_FOOTER_DATA, INITIAL_PASTORS_CONTACTS } from '../lib/constants';
import { transformImageLink } from '../utils/imageUtils';

const SiteDataContext = createContext();

const applyFavicon = (icon) => {
  if (!icon || typeof icon !== 'string') return;
  const trimmed = icon.trim();
  const isImage = trimmed.startsWith('data:image') || trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('imagem/');
  if (!isImage) return;
  const base = trimmed.startsWith('imagem/') ? transformImageLink(trimmed) : trimmed;
  const href = base.startsWith('data:') ? base : `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}`;
  const links = document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']");
  if (!links.length) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
    return;
  }
  links.forEach(link => {
    link.removeAttribute('type');
    link.href = href;
  });
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
};

export const SiteDataProvider = ({ children }) => {
  const [headerData, setHeaderData] = useState(INITIAL_HEADER_DATA);
  const [footerData, setFooterData] = useState(INITIAL_FOOTER_DATA);
  const [pastorsData, setPastorsData] = useState(INITIAL_PASTORS_CONTACTS);
  const [siteStatus, setSiteStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const loadGlobalData = async () => {
    try {
      const [hRes, fRes, sRes, pRes] = await Promise.all([
        supabase.from('site_settings').select('data').eq('key', 'header').single(),
        supabase.from('site_settings').select('data').eq('key', 'footer').single(),
        supabase.from('site_settings').select('data').eq('key', 'site_status').single(),
        supabase.from('site_settings').select('data').eq('key', 'pastors_contacts').single()
      ]);

      if (hRes.data) {
        setHeaderData(deepMerge(INITIAL_HEADER_DATA, parseSafeJson(hRes.data.data)));
      }
      if (fRes.data) {
        setFooterData(deepMerge(INITIAL_FOOTER_DATA, parseSafeJson(fRes.data.data)));
      }
      if (sRes.data) {
        setSiteStatus(parseSafeJson(sRes.data.data) || {});
      }
      if (pRes.data) {
        setPastorsData(parseSafeJson(pRes.data.data) || INITIAL_PASTORS_CONTACTS);
      }
    } catch (err) {
      console.warn('[SiteContext] Error loading global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  useEffect(() => {
    applyFavicon(headerData?.logo?.icon);
  }, [headerData?.logo?.icon]);

  const value = {
    headerData,
    footerData,
    pastorsData,
    siteStatus,
    loading,
    refreshData: loadGlobalData
  };

  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  );
};
