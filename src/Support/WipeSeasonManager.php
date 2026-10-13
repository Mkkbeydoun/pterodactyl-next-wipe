<?php

namespace RustixDev\NextWipe\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reads wipe plans from the Wipe & Season Manager extension when it is installed
 * and enabled. Nothing here depends on that extension's code: its plan table is
 * read directly, and only when both its table and its model class are present.
 */
final class WipeSeasonManager
{
    public const string TABLE = 'ext_wipe_season_manager_plans';

    public const string MODEL = 'RustixDev\\WipeSeasonManager\\Models\\WipePlan';

    public const string PERMISSION = 'ext.wipe-season-manager.manage';

    private static ?bool $available = null;

    public static function available(): bool
    {
        return self::$available ??= class_exists(self::MODEL) && Schema::hasTable(self::TABLE);
    }

    /**
     * The server's next wipe from its earliest enabled plan, or null when the
     * extension is missing or no enabled plan has an upcoming wipe. The plan's
     * next_run_at already accounts for skipped wipes and its time zone.
     */
    public static function nextFor(int $serverId): ?UpcomingWipe
    {
        if (! self::available()) {
            return null;
        }

        $plan = DB::table(self::TABLE)
            ->where('server_id', $serverId)
            ->where('enabled', true)
            ->whereNotNull('next_run_at')
            ->orderBy('next_run_at')
            ->orderBy('id')
            ->first(['name', 'repeat', 'timezone', 'next_run_at']);

        if ($plan === null) {
            return null;
        }

        return new UpcomingWipe(
            source: UpcomingWipe::SOURCE_WSM,
            label: (string) $plan->name,
            repeat: (string) $plan->repeat,
            timezone: (string) ($plan->timezone ?: 'UTC'),
            // Timestamps are stored in the panel's own zone, as Eloquent writes them.
            nextAt: CarbonImmutable::parse((string) $plan->next_run_at, config('app.timezone'))->utc(),
        );
    }
}
