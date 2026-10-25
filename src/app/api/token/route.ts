import { forwardDelete, forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_TOKEN } from '@/utils/endpointUtils';

export const GET = forwardGet(API_TOKEN);
export const POST = forwardJson('POST', API_TOKEN);
export const DELETE = forwardDelete(API_TOKEN);
