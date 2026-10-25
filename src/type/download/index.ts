export type DownloadFormat = 'csv' | 'excel';
export type DownloadStatus = 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface DownloadJob {
    id: string;
    type: string;
    format: DownloadFormat;
    status: DownloadStatus;
    fileName?: string;
    errorMessage?: string;
    modificated?: string;
    registered?: string;
}
