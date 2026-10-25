export const formatCurrency: (val: string | number) => string = (val: string | number): string => {
    const raw = String(val).replace(/\D/g, "");
    if (!raw) return "";
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    // If the time is in the future or less than 1 second
    if (diffInSeconds < 1) return "Just now";

    // Calculate time units
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Return the formatted text
    if (minutes < 60) {
        return `${minutes || 1} minutes ago`;
    } else if (hours < 24) {
        return `${hours} hours ago`;
    } else if (days < 30) {
        return `${days} days ago`;
    } else if (months < 12) {
        return `${months} months ago`;
    } else {
        return `${years} years ago`;
    }
}

// src/utils/date-utils.ts
// Utility functions for formatting dates

/**
 * Format a date string or Date object to a given format.
 * Supported tokens: YYYY, MM, DD, HH, mm, ss
 * @param date Date object or string (ISO or YYYY-MM-DD)
 * @param format Format string, e.g. 'YYYY-MM-DD', 'DD/MM/YYYY', etc.
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string): string {
    let d: Date;
    if (typeof date === 'string') {
        d = new Date(date);
    } else {
        d = date;
    }
    if (isNaN(d.getTime())) return '';
    const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
    return format
        .replace(/YYYY/g, d.getFullYear().toString())
        .replace(/MM/g, pad(d.getMonth() + 1))
        .replace(/DD/g, pad(d.getDate()))
        .replace(/HH/g, pad(d.getHours()))
        .replace(/mm/g, pad(d.getMinutes()))
        .replace(/ss/g, pad(d.getSeconds()))
        .replace(/sss/g, pad(d.getMilliseconds(), 3));
}

export function timeEnd() {
    return "T23:59:59.999Z";
}

export function timeStart() {
    return "T00:00:00.000Z";
}

export function dateTimeNow() {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    return endDate;
}

export function dateTimeOld() {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 100);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

/**
 * Example: formatDate('2025-12-11', 'DD/MM/YYYY') // '11/12/2025'
 */
