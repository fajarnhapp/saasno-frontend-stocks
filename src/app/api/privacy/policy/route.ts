import { forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_PRIVACY } from '@/utils/endpointUtils';

export const GET = forwardGet(API_PRIVACY + '/policy');
export const POST = forwardJson('POST', API_PRIVACY + '/policy');
