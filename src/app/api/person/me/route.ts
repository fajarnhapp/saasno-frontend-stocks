import { forwardGet, forwardJson } from '@/utils/proxyUtils';
import { API_PERSON_ME } from '@/utils/endpointUtils';

export const GET = forwardGet(API_PERSON_ME);
export const PUT = forwardJson('PUT', API_PERSON_ME);
