import { BaseFilter } from "../filter/BaseFilter";

export type AnnouncementLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Announcement {
    id?: string;
    title?: string;
    message?: string;
    level?: AnnouncementLevel;
    startsAt?: string | null;
    endsAt?: string | null;
    active?: boolean;
    createdBy?: string;
    modificated?: string;
    registered?: string;
}

export interface AnnouncementFilter extends BaseFilter {
    title?: string;
}
