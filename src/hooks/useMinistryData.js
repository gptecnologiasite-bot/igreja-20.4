import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';
import ContentUpdateService from '../services/atualizaçao';

export const useMinistryData = (ministryId) => {
    const [data, setData] = useState(DatabaseService.getMinistryDefault(ministryId));

    const fetchData = useCallback(async () => {
        const result = await DatabaseService.getMinistry(ministryId);
        if (result) setData(result);
    }, [ministryId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Usa o serviço de atualização para sincronização reativa
    ContentUpdateService.usePageUpdate(`admac_ministry_${ministryId}`, fetchData);

    return [data, setData];
};
