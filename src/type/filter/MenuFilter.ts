import { BaseFilter } from "./BaseFilter";

export interface MenuFilter extends BaseFilter {
    id?: string;
    name?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
