import { BaseFilter } from "./BaseFilter";

export interface RoleFilter extends BaseFilter {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
}
