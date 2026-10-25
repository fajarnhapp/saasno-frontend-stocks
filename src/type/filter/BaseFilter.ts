export const DEFAULT_FILTER = { order: 'registered', sorting: 'DESC', offset: 0, limit: 10 };
export const MAX_FILTER = { offset: 0, limit: 999999 };

export interface BaseFilter {
    order?: string;
    sorting?: string;
    offset?: number;
    limit?: number;
    custom?: string;
}