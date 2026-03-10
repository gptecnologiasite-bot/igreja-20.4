import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to track page visits.
 * Increments a visitor counter in site_settings table once per session.
 */
export const useVisitorTracker = () => {
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per component mounting/session in this tab
        if (hasTracked.current) return;
        
        const trackVisit = async () => {
            try {
                // Read current count
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('data')
                    .eq('key', 'visitor_stats')
                    .single();

                let currentCount = 0;
                if (data && data.data && typeof data.data.value === 'number') {
                    currentCount = data.data.value;
                }

                // Increment (Not atomic, but avoids new RPC/tables for now)
                const newCount = currentCount + 1;

                await supabase
                    .from('site_settings')
                    .upsert({ 
                        key: 'visitor_stats', 
                        data: { value: newCount },
                        updated_at: new Date().toISOString()
                    });
                
                hasTracked.current = true;
            } catch (err) {
                console.error('Error tracking visit:', err);
            }
        };

        trackVisit();
    }, []);
};
