/** "3d 4h 12m" until the given time, or null once it has passed. */
export function countdown(target: string, now: number = Date.now()): string | null {
    const seconds = Math.floor((new Date(target).getTime() - now) / 1000);
    if (seconds <= 0) return null;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;

    return `${minutes}m ${seconds % 60}s`;
}

/** An ISO time as the value of a datetime-local input, in the viewer's time zone. */
export function toLocalInput(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

    return local.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string {
    return new Date(value).toISOString();
}

export const REPEAT_LABELS: Record<string, string> = {
    none: 'Once',
    weekly: 'Every week',
    biweekly: 'Every two weeks',
    monthly: 'Every month, same day',
    'first-thursday': 'First Thursday of each month',
};
