import { forwardGet } from '@/utils/proxyUtils';
import { API_ANNOUNCEMENT } from '@/utils/endpointUtils';

export const GET = forwardGet(API_ANNOUNCEMENT + '/active');
