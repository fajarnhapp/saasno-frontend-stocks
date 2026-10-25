'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode, Context } from 'react';
import { useCsrf } from './CsrfContext';
import { DownloadFormat, DownloadJob } from '@/type/download';
import { createDownloadJob, deleteAllDownloadJobs, deleteDownloadJob, readDownloadJobs } from '@/service/downloadService';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';

const POLL_INTERVAL_MS = 3000;
const ACTIVE_STATUSES = ['QUEUED', 'PROCESSING'];

interface Properties {
    jobs: DownloadJob[];
    enqueue: (type: string, format: DownloadFormat, filter?: Record<string, string>) => Promise<ResponseApi<DownloadJob>>;
    dismiss: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const DownloadQueueContext: Context<Properties> = createContext<Properties>({
    jobs: [],
    enqueue: async () => ({ message: '', data: {} as DownloadJob }),
    dismiss: async () => { },
    clearAll: async () => { },
});

export const useDownloadQueue: () => Properties = (): Properties => useContext(DownloadQueueContext);

export const DownloadQueueProvider = ({ children }: { children: ReactNode }) => {
    const { csrf, setCsrf } = useCsrf();
    const [jobs, setJobs] = useState<DownloadJob[]>([]);

    const refresh = useCallback(async () => {
        const res = await readDownloadJobs(setCsrf);
        const data: ResponseApi<DownloadJob[]> = await handleResponseApi(res);
        if (data.message === API_MSG_SUCCESS) {
            setJobs(data.data || []);
        }
    }, [setCsrf]);

    useEffect(() => {
        const init = async () => {
            await refresh();
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; refresh is stable enough for polling below to take over
    }, []);

    useEffect(() => {
        const hasActiveJob = jobs.some((job) => ACTIVE_STATUSES.includes(job.status));
        if (!hasActiveJob) {
            return;
        }
        const interval = setInterval(refresh, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [jobs, refresh]);

    const enqueue = async (
        type: string,
        format: DownloadFormat,
        filter?: Record<string, string>,
    ): Promise<ResponseApi<DownloadJob>> => {
        const res = await createDownloadJob(type, format, filter, csrf, setCsrf);
        const data: ResponseApi<DownloadJob> = await handleResponseApi(res);
        if (data.message === API_MSG_SUCCESS && data.data) {
            setJobs((prev) => [data.data, ...prev]);
        }
        return data;
    };

    const dismiss = async (id: string): Promise<void> => {
        setJobs((prev) => prev.filter((job) => job.id !== id));
        await deleteDownloadJob(id, csrf, setCsrf);
    };

    // Removes every download of the signed-in user (rows and files) from the server and from the list.
    const clearAll = async (): Promise<void> => {
        const res = await deleteAllDownloadJobs(csrf, setCsrf);
        if (res.ok) {
            setJobs([]);
        }
    };

    return (
        <DownloadQueueContext.Provider value={{ jobs, enqueue, dismiss, clearAll }}>
            {children}
        </DownloadQueueContext.Provider>
    );
};
