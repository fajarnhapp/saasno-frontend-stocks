import { forwardDelete, forwardGet, forwardUpload } from '@/utils/proxyUtils';
import { API_USER_AVATAR } from '@/utils/endpointUtils';

export const GET = forwardGet(API_USER_AVATAR);
export const POST = forwardUpload(API_USER_AVATAR);
export const DELETE = forwardDelete(API_USER_AVATAR);
