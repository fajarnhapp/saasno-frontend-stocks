import { BaseFilter } from "./BaseFilter";

export interface ConfigurationFilter extends BaseFilter {
    id?: string;
    value?: string;
}
