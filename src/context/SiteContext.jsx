import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseSafeJson, deepMerge } from '../lib/dbUtils';
import { INITIAL_HEADER_DATA, INITIAL_FOOTER_DATA, INITIAL_PASTORS_CONTACTS } from '../lib/constants';

const SiteDataContext = createContext();

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
