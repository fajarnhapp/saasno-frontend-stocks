import { forwardJson } from '@/utils/proxyUtils';
import { API_USER_BULK } from '@/utils/endpointUtils';

export const POST = forwardJson('POST', API_USER_BULK);
