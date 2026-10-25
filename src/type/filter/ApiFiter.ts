import { BaseFilter } from "./BaseFilter";

export interface ApiFilter extends BaseFilter {
    id?: string;
    name?: string;
    method?: string;
    path?: string;
    startDate?: string;
    endDate?: string;
}
