import { forwardGet } from '@/utils/proxyUtils';
import { API_PERSON_EXPORT } from '@/utils/endpointUtils';

export const GET = forwardGet(API_PERSON_EXPORT);
