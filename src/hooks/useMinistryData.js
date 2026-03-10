import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { INITIAL_MINISTRIES_DATA } from '../lib/constants';
import { deepMerge, parseSafeJson } from '../lib/dbUtils';
import { usePageUpdate } from '../hooks/usePageUpdate';

export const useMinistryData = (ministryId) => {
    const defaultData = useMemo(() => 
        INITIAL_MINISTRIES_DATA[ministryId] || { hero: { title: '', subtitle: '' }, mission: { title: '', text: '' } },
    [ministryId]);
    const [data, setData] = useState(defaultData);

    useEffect(() => {
        let active = true;
        const run = async () => {
            try {
                const { data: dbData } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', `ministry_${ministryId}`)
                    .single();
                
                if (!active) return;

                if (dbData && dbData.data) {
                    setData(deepMerge(defaultData, parseSafeJson(dbData.data)));
                } else {
                    // Tenta ler do localStorage se o Supabase não tiver dados
                    const raw = localStorage.getItem(`admac_site_settings:ministry_${ministryId}`);
                    if (raw) {
                        try {
                            const local = JSON.parse(raw);
                            setData(deepMerge(defaultData, local));
                            return;
                        } catch { /* ignore */ }
                    }
                    setData(defaultData);
                }
            } catch {
                if (!active) return;
                // Fallback local em caso de erro (offline)
                const raw = localStorage.getItem(`admac_site_settings:ministry_${ministryId}`);
                if (raw) {
                    try {
                        const local = JSON.parse(raw);
                        setData(deepMerge(defaultData, local));
                        return;
                    } catch { /* ignore */ }
                }
                setData(defaultData);
            }
        };
        setTimeout(run, 0);
        return () => { active = false; };
    }, [ministryId, defaultData]);

    // Sincronização reativa
    usePageUpdate(`ministry_${ministryId}`, () => {
        let active = true;
        const run = async () => {
            try {
                const { data: dbData } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', `ministry_${ministryId}`)
                    .single();
                if (!active) return;
                
                if (dbData?.data) {
                    setData(deepMerge(defaultData, parseSafeJson(dbData.data)));
                } else {
                    const raw = localStorage.getItem(`admac_site_settings:ministry_${ministryId}`);
                    if (raw) {
                        try {
                            const local = JSON.parse(raw);
                            setData(deepMerge(defaultData, local));
                            return;
                        } catch { /* ignore */ }
                    }
                    setData(defaultData);
                }
            } catch {
                if (!active) return;
                const raw = localStorage.getItem(`admac_site_settings:ministry_${ministryId}`);
                if (raw) {
                    try {
                        const local = JSON.parse(raw);
                        setData(deepMerge(defaultData, local));
                        return;
                    } catch { /* ignore */ }
                }
                setData(defaultData);
            }
        };
        run();
        return () => { active = false; };
    });

    return [data, setData];
};
