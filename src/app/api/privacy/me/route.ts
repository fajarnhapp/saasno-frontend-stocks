import { forwardGet } from '@/utils/proxyUtils';
import { API_PRIVACY } from '@/utils/endpointUtils';

export const GET = forwardGet(API_PRIVACY + '/me');
