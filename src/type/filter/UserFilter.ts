import { BaseFilter } from "./BaseFilter";

export interface UserFilter extends BaseFilter {
    id?: string;
    username?: string;
    // The backend resolves dotted names through the relation (user -> person).
    "person.fullName"?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
