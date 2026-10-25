import { forwardDelete, forwardUpload } from '@/utils/proxyUtils';
import { API_APP_SETTING_LOGO } from '@/utils/endpointUtils';

export const POST = forwardUpload(API_APP_SETTING_LOGO);
export const DELETE = forwardDelete(API_APP_SETTING_LOGO);
