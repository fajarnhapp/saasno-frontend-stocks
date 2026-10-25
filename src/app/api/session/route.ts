import { forwardDelete, forwardGet } from '@/utils/proxyUtils';
import { API_SESSION } from '@/utils/endpointUtils';

export const GET = forwardGet(API_SESSION);
export const DELETE = forwardDelete(API_SESSION);
