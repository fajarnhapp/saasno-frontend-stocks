import { forwardGet, forwardPut } from '@/utils/proxyUtils';
import { API_PRIVACY } from '@/utils/endpointUtils';

export const GET = forwardGet(API_PRIVACY + '/delete-requests');
export const PUT = forwardPut(API_PRIVACY + '/delete-requests');
