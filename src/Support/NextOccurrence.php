<?php

namespace RustixDev\NextWipe\Support;

use Carbon\CarbonImmutable;

/**
 * Works out the next wipe from the first one and how it repeats. All times are UTC.
 */
final class NextOccurrence
{
    public const array REPEATS = ['none', 'weekly', 'biweekly', 'monthly', 'first-thursday'];

    public static function after(CarbonImmutable $anchor, string $repeat, CarbonImmutable $now): ?CarbonImmutable
    {
        if ($anchor->greaterThan($now)) {
            return $anchor;
        }

        return match ($repeat) {
            'weekly' => self::stepDays($anchor, 7, $now),
            'biweekly' => self::stepDays($anchor, 14, $now),
            'monthly' => self::monthly($anchor, $now),
            'first-thursday' => self::firstThursday($anchor, $now),
            default => null,
        };
    }

    private static function stepDays(CarbonImmutable $anchor, int $days, CarbonImmutable $now): CarbonImmutable
    {
        $steps = intdiv((int) $anchor->diffInDays($now, true), $days);
        $next = $anchor->addDays($steps * $days);

        while ($next->lessThanOrEqualTo($now)) {
            $next = $next->addDays($days);
        }

        return $next;
    }

    /** Same day of the month as the first wipe, clamped to the month's last day. */
    private static function monthly(CarbonImmutable $anchor, CarbonImmutable $now): CarbonImmutable
    {
        $month = $now->startOfMonth();

        for ($i = 0; $i < 3; $i++) {
            $candidate = $month->addMonths($i)
                ->setDay(min($anchor->day, $month->addMonths($i)->daysInMonth))
                ->setTime($anchor->hour, $anchor->minute);

            if ($candidate->greaterThan($now)) {
                return $candidate;
            }
        }

        return $anchor->addMonths(1);
    }

    /** The first Thursday of each month at the first wipe's time (Rust's monthly forced wipe). */
    private static function firstThursday(CarbonImmutable $anchor, CarbonImmutable $now): CarbonImmutable
    {
        $month = $now->startOfMonth();

        for ($i = 0; $i < 3; $i++) {
            $first = $month->addMonths($i);
            $candidate = $first->addDays((4 - $first->dayOfWeek + 7) % 7)->setTime($anchor->hour, $anchor->minute);

            if ($candidate->greaterThan($now)) {
                return $candidate;
            }
        }

        return $anchor;
    }
}
