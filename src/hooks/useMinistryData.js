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
                const { data: dbData, error } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', `ministry_${ministryId}`)
                    .single();
                
                if (!active) return;

                if (error) {
                    console.warn(`[Supabase] Erro ao carregar ministério ${ministryId}:`, error.message);
                    
                    // Fallback para localStorage
                    const raw = localStorage.getItem(`admac_site_settings:ministry_${ministryId}`);
                    if (raw) {
                        try {
                            const local = JSON.parse(raw);
                            setData(deepMerge(defaultData, local));
                            console.info(`[Storage] Usando cache local para ${ministryId}.`);
                            return;
                        } catch (e) {
                            console.error(`[Storage] JSON inválido para ${ministryId}:`, e);
                        }
                    }
                    setData(defaultData);
                    return;
                }

                if (dbData && dbData.data) {
                    const parsed = parseSafeJson(dbData.data);
                    setData(deepMerge(defaultData, parsed));
                    // Cacheia para uso offline
                    localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(parsed));
                } else {
                    setData(defaultData);
                }
            } catch (err) {
                if (!active) return;
                console.error(`[useMinistryData] Exceção crítica em ${ministryId}:`, err);
                setData(defaultData);
            }
        };
        run();
        return () => { active = false; };
    }, [ministryId, defaultData]);

    // Sincronização reativa (Realtime fallback)
    usePageUpdate(`ministry_${ministryId}`, () => {
        let active = true;
        const run = async () => {
            try {
                const { data: dbData, error } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', `ministry_${ministryId}`)
                    .single();
                if (!active) return;
                
                if (error) {
                    console.warn(`[Realtime Update] Erro ao sincronizar ${ministryId}:`, error.message);
                    return;
                }

                if (dbData?.data) {
                    const parsed = parseSafeJson(dbData.data);
                    setData(deepMerge(defaultData, parsed));
                    localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(parsed));
                }
            } catch (err) {
                console.error(`[Realtime Update] Exceção em ${ministryId}:`, err);
            }
        };
        run();
        return () => { active = false; };
    });

    return [data, setData];
};
