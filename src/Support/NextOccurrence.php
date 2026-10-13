<?php

namespace RustixDev\NextWipe\Support;

use Carbon\CarbonImmutable;

/**
 * Works out the next wipe from the first one and how it repeats. The calendar is
 * read in the schedule's own time zone, so "every Thursday at 19:00" stays at
 * 19:00 local time across daylight saving changes (the same rules Wipe & Season
 * Manager uses). Results are returned in UTC.
 */
final class NextOccurrence
{
    public const array REPEATS = ['none', 'weekly', 'biweekly', 'monthly', 'first-thursday'];

    /** The first wipe strictly after $now, or null when a one-off wipe has passed. */
    public static function after(CarbonImmutable $anchor, string $repeat, CarbonImmutable $now, string $timezone = 'UTC'): ?CarbonImmutable
    {
        // The first wipe's wall-clock time in its own zone is what repeats.
        $local = $anchor->setTimezone($timezone);
        $anchor = CarbonImmutable::create($local->year, $local->month, $local->day, $local->hour, $local->minute, 0, $timezone);
        $now = $now->setTimezone($timezone);

        if ($anchor->greaterThan($now)) {
            return $anchor->utc();
        }

        $next = match ($repeat) {
            'weekly' => self::stepDays($anchor, 7, $now),
            'biweekly' => self::stepDays($anchor, 14, $now),
            'monthly' => self::monthly($anchor, $now),
            'first-thursday' => self::firstThursday($anchor, $now),
            default => null,
        };

        return $next?->utc();
    }

    private static function stepDays(CarbonImmutable $anchor, int $days, CarbonImmutable $now): CarbonImmutable
    {
        $steps = intdiv((int) $anchor->startOfDay()->diffInDays($now->startOfDay(), true), $days);
        $next = $anchor->addDays($steps * $days);

        while ($next->lessThanOrEqualTo($now)) {
            $next = $next->addDays($days);
        }

        return $next;
    }

    /** Same day of the month as the first wipe, moved to the month's last day when it is shorter. */
    private static function monthly(CarbonImmutable $anchor, CarbonImmutable $now): CarbonImmutable
    {
        $month = $now->startOfMonth();

        for ($i = 0; $i < 3; $i++) {
            $start = $month->addMonthsNoOverflow($i);
            $candidate = $start->setDay(min($anchor->day, $start->daysInMonth))->setTime($anchor->hour, $anchor->minute);

            if ($candidate->greaterThan($now)) {
                return $candidate;
            }
        }

        return $anchor->addMonthsNoOverflow(1);
    }

    /** The first Thursday of each month at the first wipe's time (Rust's monthly forced wipe). */
    private static function firstThursday(CarbonImmutable $anchor, CarbonImmutable $now): CarbonImmutable
    {
        $month = $now->startOfMonth();

        for ($i = 0; $i < 3; $i++) {
            $start = $month->addMonthsNoOverflow($i);
            $candidate = $start->addDays((4 - $start->dayOfWeek + 7) % 7)->setTime($anchor->hour, $anchor->minute);

            if ($candidate->greaterThan($now)) {
                return $candidate;
            }
        }

        return $anchor;
    }
}
