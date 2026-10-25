import { forwardDelete } from '@/utils/proxyUtils';
import { API_USER_PURGE } from '@/utils/endpointUtils';

export const DELETE = forwardDelete(API_USER_PURGE);
