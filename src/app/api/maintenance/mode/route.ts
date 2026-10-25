import { forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_MAINTENANCE_MODE } from '@/utils/endpointUtils';

export const GET = forwardGet(API_MAINTENANCE_MODE);
export const PUT = forwardJson('PUT', API_MAINTENANCE_MODE);
