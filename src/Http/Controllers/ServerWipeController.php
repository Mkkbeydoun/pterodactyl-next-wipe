<?php

namespace RustixDev\NextWipe\Http\Controllers;

use Carbon\CarbonImmutable;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Server;
use RustixDev\NextWipe\Models\WipeSchedule;
use RustixDev\NextWipe\Support\NextOccurrence;
use RustixDev\NextWipe\Support\UpcomingWipe;
use RustixDev\NextWipe\Support\WipeSeasonManager;

class ServerWipeController
{
    public const string PERMISSION = 'ext.next-wipe.manage';

    public function show(Request $request, Server $server): JsonResponse
    {
        $schedule = WipeSchedule::query()->where('server_id', $server->id)->first();

        return new JsonResponse($this->payload($request, $server, $schedule));
    }

    public function update(Request $request, Server $server): JsonResponse
    {
        $this->authorize($request, $server);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:60'],
            // The wall-clock time in `timezone`; `anchor_at` (an exact time) is still accepted from older clients.
            'anchor_local' => ['required_without:anchor_at', 'date_format:Y-m-d\TH:i'],
            'anchor_at' => ['required_without:anchor_local', 'date'],
            'timezone' => ['nullable', 'string', 'max:64', 'timezone:all_with_bc'],
            'repeat' => ['required', Rule::in(NextOccurrence::REPEATS)],
            'public' => ['boolean'],
        ], [], ['anchor_local' => 'next wipe', 'anchor_at' => 'next wipe', 'repeat' => 'repeat', 'timezone' => 'time zone']);

        $timezone = $data['timezone'] ?? 'UTC';
        $anchor = isset($data['anchor_local'])
            ? CarbonImmutable::createFromFormat('Y-m-d\TH:i', $data['anchor_local'], new DateTimeZone($timezone))
            : CarbonImmutable::parse($data['anchor_at']);

        $schedule = WipeSchedule::query()->firstOrNew(['server_id' => $server->id]);
        $schedule->fill([
            'label' => $data['label'],
            'anchor_at' => $anchor->utc(),
            'repeat' => $data['repeat'],
            'timezone' => $timezone,
            'public' => (bool) ($data['public'] ?? false),
        ]);
        $schedule->public_token ??= Str::random(32);
        $schedule->save();

        return new JsonResponse($this->payload($request, $server, $schedule));
    }

    /** Turn the public page on or off on its own, for servers whose wipes come from Wipe & Season Manager. */
    public function updatePublic(Request $request, Server $server): JsonResponse
    {
        $this->authorize($request, $server);
        $data = $request->validate(['public' => ['required', 'boolean']]);

        $schedule = WipeSchedule::query()->firstOrNew(['server_id' => $server->id]);
        if (! $schedule->exists) {
            // Only the public page is used while Wipe & Season Manager has a plan.
            $schedule->fill(['label' => 'Wipe', 'anchor_at' => CarbonImmutable::now()->startOfMinute(), 'repeat' => 'none', 'timezone' => 'UTC']);
        }
        $schedule->public = (bool) $data['public'];
        $schedule->public_token ??= Str::random(32);
        $schedule->save();

        return new JsonResponse($this->payload($request, $server, $schedule));
    }

    public function destroy(Request $request, Server $server): Response
    {
        $this->authorize($request, $server);

        WipeSchedule::query()->where('server_id', $server->id)->delete();

        return response()->noContent();
    }

    /** @return array<string, mixed> */
    private function payload(Request $request, Server $server, ?WipeSchedule $schedule): array
    {
        $canManage = $this->canManage($request, $server);
        $upcoming = UpcomingWipe::forServer($server->id, $schedule);

        return [
            'data' => $upcoming ? [
                'source' => $upcoming->source,
                'label' => $upcoming->label,
                'repeat' => $upcoming->repeat,
                'timezone' => $upcoming->timezone,
                'next_at' => $upcoming->nextAt?->toIso8601String(),
            ] : null,
            'schedule' => $canManage ? $schedule?->toSettings() : null,
            'public' => (bool) $schedule?->public,
            'public_url' => $canManage ? $schedule?->publicUrl() : null,
            'can_manage' => $canManage,
            // Whether this user can open the server's Wipes tab.
            'can_manage_plans' => WipeSeasonManager::available() && $request->user()->can(WipeSeasonManager::PERMISSION, $server),
        ];
    }

    /** Next Wipe's own permission, or Wipe & Season Manager's, lets a subuser change the schedule. */
    private function canManage(Request $request, Server $server): bool
    {
        $user = $request->user();

        return $user->can(self::PERMISSION, $server) || $user->can(WipeSeasonManager::PERMISSION, $server);
    }

    private function authorize(Request $request, Server $server): void
    {
        abort_unless($this->canManage($request, $server), 403);
    }
}
