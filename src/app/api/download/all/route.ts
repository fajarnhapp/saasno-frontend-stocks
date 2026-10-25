import { forwardDelete } from '@/utils/proxyUtils';
import { API_DOWNLOAD_ALL } from '@/utils/endpointUtils';

export const DELETE = forwardDelete(API_DOWNLOAD_ALL);
