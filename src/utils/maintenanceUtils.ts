const MONTHS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UNTIL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

// "2026-10-23T18:00" -> "23 Oct 2026, 18:00". Anything else is shown as it is.
export function formatUntil(until: string | null | undefined): string {
    const match: RegExpMatchArray | null = until ? until.match(UNTIL) : null;
    if (!match) {
        return until ?? '';
    }
    const month: string | undefined = MONTHS[parseInt(match[2], 10) - 1];
    return month ? `${parseInt(match[3], 10)} ${month} ${match[1]}, ${match[4]}:${match[5]}` : until ?? '';
}

// The value a <input type="datetime-local"> takes: yyyy-MM-ddTHH:mm, in the browser's own time.
export function toDatetimeLocal(date: Date): string {
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// SUPER can never be left out: it is how maintenance is switched off again. Others keep the order they were chosen in.
export function withSuper(roles: string[]): string[] {
    return ['SUPER', ...roles.filter((role: string) => role !== 'SUPER')];
}

export function toggleRole(roles: string[], role: string): string[] {
    if (role === 'SUPER') {
        return withSuper(roles);
    }
    return withSuper(roles.includes(role) ? roles.filter((r: string) => r !== role) : [...roles, role]);
}

// The end time of an earlier maintenance is of no use for a new one: keep it only while it is still ahead.
// Both values are yyyy-MM-ddTHH:mm, which sorts the same as time does.
export function upcomingOrEmpty(until: string | null | undefined, now: string): string {
    return until && UNTIL.test(until) && until > now ? until : '';
}
