import { BaseFilter } from "./BaseFilter";

export interface RoleApiFilter extends BaseFilter {
    'role.id'?: string;
    roleId?: string;
    apiId?: string;
    startDate?: string;
    endDate?: string;
}
