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
        
        const fetchLocation = async () => {
            const APIS = [
                {
                    url: 'https://freeipapi.com/api/json',
                    parse: (d) => {
                        if (d.cityName && d.regionName) {
                            return {
                                city: d.cityName,
                                region: d.regionName,
                                country: d.countryName,
                                label: `${d.cityName}, ${d.regionName} - ${d.countryName}`
                            };
                        }
                        return null;
                    }
                },
                {
                    url: 'http://ip-api.com/json/',
                    parse: (d) => {
                        if (d.status === 'success') {
                            return {
                                city: d.city,
                                region: d.regionName || d.region,
                                country: d.country,
                                label: `${d.city}, ${d.regionName || d.region} - ${d.country}`
                            };
                        }
                        return null;
                    }
                },
                {
                    url: 'https://ipapi.co/json/',
                    parse: (d) => {
                        if (d.city && d.region) {
                            return {
                                city: d.city,
                                region: d.region,
                                country: d.country_name,
                                label: `${d.city}, ${d.region} - ${d.country_name}`
                            };
                        }
                        return null;
                    }
                }
            ];

            for (const api of APIS) {
                try {
                    const res = await fetch(api.url, { signal: AbortSignal.timeout(3000) });
                    if (!res.ok) continue;
                    const data = await res.json();
                    const parsed = api.parse(data);
                    if (parsed) return parsed;
                } catch (e) {
                    console.warn(`[Tracker] Falha na API ${api.url}:`, e.message);
                }
            }
            return { label: 'Desconhecido', city: '', region: '', country: '' };
        };

        const trackVisit = async () => {
            try {
                // 1. Get detailed location
                const locObj = await fetchLocation();
                const location = locObj.label;

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

                // 3. Update counter and record the "last visitor" info
                const newCount = currentCount + 1;
                
                await Promise.all([
                    supabase.from('site_settings').upsert({ 
                        key: 'visitor_stats', 
                        data: { value: newCount },
                        updated_at: new Date().toISOString()
                    }),
                    supabase.from('site_settings').upsert({ 
                        key: 'last_visit', 
                        data: { 
                            location, 
                            city: locObj.city,
                            region: locObj.region,
                            country: locObj.country,
                            timestamp: Date.now() 
                        },
                        updated_at: new Date().toISOString()
                    }),
                    // 4. Grava log de acesso para histórico
                    supabase.from('site_logs').insert({
                        action: 'visitor_access',
                        details: `Novo visitante de ${location}`,
                        user_email: location // Usamos o campo user_email para guardar a localização do visitante
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
