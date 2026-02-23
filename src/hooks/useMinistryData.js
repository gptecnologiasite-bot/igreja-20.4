import { useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';

export const useMinistryData = (ministryId) => {
    const [data, setData] = useState(DatabaseService.getMinistryDefault(ministryId));

    useEffect(() => {
        const fetchData = async () => {
            const result = await DatabaseService.getMinistry(ministryId);
            if (result) setData(result);
        };

        fetchData();

        const handleStorageChange = (e) => {
            // Only update if the changed key matches this ministry or if it's a general update
            if (!e.key || e.key.includes(ministryId)) {
                fetchData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [ministryId]);

    return [data, setData];
};
