import { forwardJson } from '@/utils/proxyUtils';
import { API_USER_IMPORT } from '@/utils/endpointUtils';

export const POST = forwardJson('POST', API_USER_IMPORT);
