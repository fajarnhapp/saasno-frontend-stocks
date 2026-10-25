// Event type (e.g. USER_CREATED) and an optional relative link to the page the notification refers to.
export interface NotificationMessage {
    id?: string;
    title?: string;
    type?: string;
    link?: string;
    message?: string;
    registered?: string;
}
