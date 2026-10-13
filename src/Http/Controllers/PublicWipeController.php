<?php

namespace RustixDev\NextWipe\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RustixDev\NextWipe\Models\WipeSchedule;
use RustixDev\NextWipe\Support\UpcomingWipe;
use Symfony\Component\HttpFoundation\Response;

/**
 * The opt-in public page, for Discord and websites. Shows the server name and wipe
 * time only. When Wipe & Season Manager has a plan for the server, its next wipe is shown.
 */
class PublicWipeController
{
    public function show(Request $request, string $token): Response
    {
        $schedule = WipeSchedule::query()->with('server:id,name')->where('public_token', $token)->where('public', true)->firstOrFail();
        $upcoming = UpcomingWipe::forServer($schedule->server_id, $schedule);
        $next = $upcoming?->nextAt;

        $payload = [
            'server' => $schedule->server->name,
            'label' => $upcoming->label ?? $schedule->label,
            'next_at' => $next?->toIso8601String(),
            'next_unix' => $next?->getTimestamp(),
            'repeat' => $upcoming->repeat ?? $schedule->repeat,
            'timezone' => $upcoming->timezone ?? 'UTC',
            'next_local' => $upcoming?->localDescription(),
        ];

        $headers = ['Cache-Control' => 'public, max-age=60', 'Access-Control-Allow-Origin' => '*'];

        if ($request->query('format') === 'json' || $request->wantsJson()) {
            return new JsonResponse($payload, 200, $headers);
        }

        return response()->view('ext-next-wipe::public', $payload, 200, $headers + [
            // Can be embedded in an iframe on any site.
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors *",
        ]);
    }
}
