import { forwardDelete } from '@/utils/proxyUtils';
import { API_MAINTENANCE_DOWNLOAD } from '@/utils/endpointUtils';

export const DELETE = forwardDelete(API_MAINTENANCE_DOWNLOAD);
