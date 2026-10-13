<?php

namespace RustixDev\NextWipe\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Server;
use RustixDev\NextWipe\Support\NextOccurrence;

/**
 * @property int $id
 * @property int $server_id
 * @property string $label
 * @property CarbonImmutable $anchor_at
 * @property string $repeat
 * @property string $timezone
 * @property bool $public
 * @property string|null $public_token
 * @property Server $server
 */
class WipeSchedule extends Model
{
    protected $table = 'ext_next_wipe_schedules';

    protected $fillable = ['server_id', 'label', 'anchor_at', 'repeat', 'timezone', 'public', 'public_token'];

    protected $attributes = ['timezone' => 'UTC'];

    protected function casts(): array
    {
        return [
            'anchor_at' => 'immutable_datetime',
            'public' => 'boolean',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function next(?CarbonImmutable $now = null): ?CarbonImmutable
    {
        return NextOccurrence::after($this->anchor_at->utc(), $this->repeat, ($now ?? CarbonImmutable::now())->utc(), $this->timezone ?: 'UTC');
    }

    /** The schedule's own settings, for the edit form. */
    public function toSettings(): array
    {
        $zone = $this->timezone ?: 'UTC';
        // The form shows the next wipe (or the first one) in the schedule's own zone.
        $at = ($this->next() ?? $this->anchor_at)->setTimezone($zone);

        return [
            'label' => $this->label,
            'anchor_at' => $this->anchor_at->utc()->toIso8601String(),
            'anchor_local' => $at->format('Y-m-d\TH:i'),
            'repeat' => $this->repeat,
            'timezone' => $zone,
        ];
    }

    public function publicUrl(): ?string
    {
        return $this->public && $this->public_token ? url('/extensions/next-wipe/s/'.$this->public_token) : null;
    }
}
