<?php

namespace RustixDev\NextWipe\Support;

use Carbon\CarbonImmutable;
use RustixDev\NextWipe\Models\WipeSchedule;

/** The wipe a server shows: from a Wipe & Season Manager plan when it has one, otherwise from its own schedule. */
final readonly class UpcomingWipe
{
    public const string SOURCE_SCHEDULE = 'next-wipe';

    public const string SOURCE_WSM = 'wipe-season-manager';

    public function __construct(
        public string $source,
        public string $label,
        public string $repeat,
        public string $timezone,
        public ?CarbonImmutable $nextAt,
    ) {}

    public static function forServer(int $serverId, ?WipeSchedule $schedule, ?CarbonImmutable $now = null): ?self
    {
        if ($wsm = WipeSeasonManager::nextFor($serverId)) {
            return $wsm;
        }

        if ($schedule === null) {
            return null;
        }

        return new self(
            source: self::SOURCE_SCHEDULE,
            label: $schedule->label,
            repeat: $schedule->repeat,
            timezone: $schedule->timezone ?: 'UTC',
            nextAt: $schedule->next($now),
        );
    }

    public function fromWipeSeasonManager(): bool
    {
        return $this->source === self::SOURCE_WSM;
    }

    /** "Thursday 15 October 2026, 19:00 BST (Europe/London)", in the schedule's own zone. */
    public function localDescription(): ?string
    {
        if ($this->nextAt === null) {
            return null;
        }

        $local = $this->nextAt->setTimezone($this->timezone);
        $text = $local->format('l j F Y, H:i T');

        return $local->format('T') === $this->timezone ? $text : $text.' ('.$this->timezone.')';
    }
}
