import { forwardGet } from '@/utils/proxyUtils';
import { API_CHANGE_LOG } from '@/utils/endpointUtils';

export const GET = forwardGet(API_CHANGE_LOG);
