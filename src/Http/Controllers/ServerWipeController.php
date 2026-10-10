<?php

namespace RustixDev\NextWipe\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Server;
use RustixDev\NextWipe\Models\WipeSchedule;
use RustixDev\NextWipe\Support\NextOccurrence;

class ServerWipeController
{
    public function show(Request $request, Server $server): JsonResponse
    {
        $schedule = WipeSchedule::query()->where('server_id', $server->id)->first();
        $canManage = $request->user()->can('ext.next-wipe.manage', $server);

        return new JsonResponse([
            'data' => $schedule?->toPayload($canManage),
            'can_manage' => $canManage,
        ]);
    }

    public function update(Request $request, Server $server): JsonResponse
    {
        abort_unless($request->user()->can('ext.next-wipe.manage', $server), 403);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:60'],
            'anchor_at' => ['required', 'date'],
            'repeat' => ['required', Rule::in(NextOccurrence::REPEATS)],
            'public' => ['boolean'],
        ], [], ['anchor_at' => 'next wipe', 'repeat' => 'repeat']);

        $schedule = WipeSchedule::query()->firstOrNew(['server_id' => $server->id]);
        $schedule->fill([
            'label' => $data['label'],
            'anchor_at' => $data['anchor_at'],
            'repeat' => $data['repeat'],
            'public' => (bool) ($data['public'] ?? false),
        ]);
        $schedule->public_token ??= Str::random(32);
        $schedule->save();

        return new JsonResponse(['data' => $schedule->toPayload(true), 'can_manage' => true]);
    }

    public function destroy(Request $request, Server $server): Response
    {
        abort_unless($request->user()->can('ext.next-wipe.manage', $server), 403);

        WipeSchedule::query()->where('server_id', $server->id)->delete();

        return response()->noContent();
    }
}
