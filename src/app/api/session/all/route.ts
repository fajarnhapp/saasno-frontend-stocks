import { forwardDelete, forwardGet } from '@/utils/proxyUtils';
import { API_SESSION_ALL } from '@/utils/endpointUtils';

export const GET = forwardGet(API_SESSION_ALL);
export const DELETE = forwardDelete(API_SESSION_ALL);
