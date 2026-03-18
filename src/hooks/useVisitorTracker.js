import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to track page visits.
 * Increments a visitor counter and records location in site_settings table once per session.
 */
export const useVisitorTracker = () => {
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per component mounting/session in this tab
        if (hasTracked.current) return;
        
        const trackVisit = async () => {
            try {
                // 1. Get location via free IP API
                let location = 'Desconhecido';
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const locData = await res.json();
                    if (locData.city && locData.region_code) {
                        location = `${locData.city} / ${locData.region_code}`;
                    } else if (locData.country_name) {
                        location = locData.country_name;
                    }
                } catch (e) {
                    console.warn('[Tracker] Falha ao obter localização:', e.message);
                }

                // 2. Read current stats
                const { data: statsData } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', 'visitor_stats')
                    .single();

                let currentCount = 0;
                if (statsData && statsData.data && typeof statsData.data.value === 'number') {
                    currentCount = statsData.data.value;
                }

                // 3. Update counter and record the "last visitor" info to trigger the bell/notif
                const newCount = currentCount + 1;
                
                // We update BOTH the count and a 'last_visit' key that the Header will listen to
                await Promise.all([
                    supabase.from('site_settings').upsert({ 
                        key: 'visitor_stats', 
                        data: { value: newCount },
                        updated_at: new Date().toISOString()
                    }),
                    supabase.from('site_settings').upsert({ 
                        key: 'last_visit', 
                        data: { location, timestamp: Date.now() },
                        updated_at: new Date().toISOString()
                    })
                ]);
                
                hasTracked.current = true;
            } catch (err) {
                console.error('Error tracking visit:', err);
            }
        };

        trackVisit();
    }, []);
};
