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
                    setData(defaultData);
                }
            } catch {
                if (!active) return;
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
                setData(deepMerge(defaultData, parseSafeJson(dbData?.data) || defaultData));
            } catch {
                if (!active) return;
                setData(defaultData);
            }
        };
        run();
        return () => { active = false; };
    });

    return [data, setData];
};
