import { NotificationMessage } from "./NotificationMessage";

export interface Notification {
    id?: string;
    userId?: string;
    notificationMessage?: NotificationMessage;
    status?: number;
    modificated?: string;
    registered?: string;
}