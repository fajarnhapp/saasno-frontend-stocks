import { forwardPost } from '@/utils/proxyUtils';
import { API_PRIVACY } from '@/utils/endpointUtils';

export const POST = forwardPost(API_PRIVACY + '/accept');
