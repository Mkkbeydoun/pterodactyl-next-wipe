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

export function browserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

export function timezones(): string[] {
    try {
        return Intl.supportedValuesOf('timeZone');
    } catch {
        return ['UTC'];
    }
}

/** An exact time as a datetime-local value ("2026-10-15T19:00") on the wall clock of a time zone. */
export function toZonedInput(iso: string | null, timeZone: string): string {
    if (!iso) return '';
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
            .formatToParts(new Date(iso))
            .map((part) => [part.type, part.value])
    );

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** A date and time for people to read, in the viewer's zone unless one is given. */
export function formatWhen(iso: string, timeZone?: string): string {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone });
}

export const REPEAT_LABELS: Record<string, string> = {
    none: 'Once',
    weekly: 'Every week',
    biweekly: 'Every two weeks',
    monthly: 'Every month, same day',
    'first-thursday': 'First Thursday of each month',
};

/** Wipe & Season Manager plans can also repeat these ways. */
const OTHER_REPEAT_LABELS: Record<string, string> = {
    once: 'Once',
    daily: 'Every day',
};

export const repeatLabel = (repeat: string): string => REPEAT_LABELS[repeat] ?? OTHER_REPEAT_LABELS[repeat] ?? repeat;
