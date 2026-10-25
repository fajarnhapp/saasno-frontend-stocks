import { forwardDelete, forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_ANNOUNCEMENT } from '@/utils/endpointUtils';

export const GET = forwardGet(API_ANNOUNCEMENT);
export const POST = forwardJson('POST', API_ANNOUNCEMENT);
export const PUT = forwardJson('PUT', API_ANNOUNCEMENT);
export const DELETE = forwardDelete(API_ANNOUNCEMENT);
