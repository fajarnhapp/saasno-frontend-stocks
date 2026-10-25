import { forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_APP_SETTING } from '@/utils/endpointUtils';

export const GET = forwardGet(API_APP_SETTING);
export const PUT = forwardJson('PUT', API_APP_SETTING);
