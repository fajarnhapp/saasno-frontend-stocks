import { BaseFilter } from "./BaseFilter";

export interface RoleMenuFilter extends BaseFilter {
    'role.id'?: string;
    roleId?: string;
    menuId?: string;
    startDate?: string;
    endDate?: string;
}
