export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getDateToday(): string {
    return formatLocalDate(new Date());
}

export function getDateHPlus30(baseDate: Date = new Date()): string {
    const targetDate = new Date(baseDate);
    targetDate.setDate(targetDate.getDate() + 30);
    return formatLocalDate(targetDate);
}

export function getFirstDayOfMonth(baseDate: Date = new Date()): string {
    const targetDate = new Date(baseDate);
    targetDate.setDate(1);

    return formatLocalDate(targetDate);
}

export function getLastDayOfMonth(baseDate: Date = new Date()): string {
    const targetDate = new Date(baseDate);
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(-1);

    return formatLocalDate(targetDate);
}