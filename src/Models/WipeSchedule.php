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
 * @property bool $public
 * @property string|null $public_token
 * @property Server $server
 */
class WipeSchedule extends Model
{
    protected $table = 'ext_next_wipe_schedules';

    protected $fillable = ['server_id', 'label', 'anchor_at', 'repeat', 'public', 'public_token'];

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
        return NextOccurrence::after($this->anchor_at->utc(), $this->repeat, ($now ?? CarbonImmutable::now())->utc());
    }

    /** @return array<string, mixed> */
    public function toPayload(bool $withToken): array
    {
        return [
            'label' => $this->label,
            'anchor_at' => $this->anchor_at->utc()->toIso8601String(),
            'repeat' => $this->repeat,
            'next_at' => $this->next()?->toIso8601String(),
            'public' => $this->public,
            'public_url' => $withToken && $this->public && $this->public_token
                ? url('/extensions/next-wipe/s/'.$this->public_token)
                : null,
        ];
    }
}
