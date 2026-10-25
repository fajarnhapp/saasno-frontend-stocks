import { forwardPost } from '@/utils/proxyUtils';
import { API_MAINTENANCE_CLEANUP } from '@/utils/endpointUtils';

export const POST = forwardPost(API_MAINTENANCE_CLEANUP);
