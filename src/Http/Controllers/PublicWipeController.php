<?php

namespace RustixDev\NextWipe\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RustixDev\NextWipe\Models\WipeSchedule;
use Symfony\Component\HttpFoundation\Response;

/** The opt-in public page, for Discord bots and websites. Shows the server name and wipe time only. */
class PublicWipeController
{
    public function show(Request $request, string $token): Response
    {
        $schedule = WipeSchedule::query()->with('server:id,name')->where('public_token', $token)->where('public', true)->firstOrFail();
        $next = $schedule->next();

        $payload = [
            'server' => $schedule->server->name,
            'label' => $schedule->label,
            'next_at' => $next?->toIso8601String(),
            'next_unix' => $next?->getTimestamp(),
            'repeat' => $schedule->repeat,
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
