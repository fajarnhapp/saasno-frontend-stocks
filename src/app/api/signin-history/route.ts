import { forwardGet } from '@/utils/proxyUtils';
import { API_SIGNIN_HISTORY } from '@/utils/endpointUtils';

export const GET = forwardGet(API_SIGNIN_HISTORY);
