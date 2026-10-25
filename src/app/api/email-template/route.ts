import { forwardDelete, forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_EMAIL_TEMPLATE } from '@/utils/endpointUtils';

export const GET = forwardGet(API_EMAIL_TEMPLATE);
export const PUT = forwardJson('PUT', API_EMAIL_TEMPLATE);
export const DELETE = forwardDelete(API_EMAIL_TEMPLATE);
