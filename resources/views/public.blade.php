<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $label }} · {{ $server }}</title>
@php($summary = $next_local ? 'Next wipe: '.$next_local : 'No wipe scheduled')
<meta name="description" content="{{ $summary }}">
{{-- Discord and other sites build their link preview from these. --}}
<meta property="og:type" content="website">
<meta property="og:title" content="{{ $server }} · {{ $label }}">
<meta property="og:description" content="{{ $summary }}">
<meta name="theme-color" content="#3b82f6">
<style>
:root { color-scheme: light dark; --bg: #f4f5f7; --fg: #1d2330; --muted: #5d6576; --card: #ffffff; --line: #dfe2e8; }
@media (prefers-color-scheme: dark) { :root { --bg: #1b1f27; --fg: #eef0f4; --muted: #9aa3b2; --card: #252a34; --line: #343a46; } }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { width: 100%; max-width: 420px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 24px; text-align: center; }
h1 { margin: 0 0 4px; font-size: 1rem; font-weight: 600; overflow-wrap: anywhere; }
p { margin: 0; color: var(--muted); font-size: .9rem; }
.zone { margin-top: 4px; font-size: .8rem; }
.count { margin: 16px 0 8px; font-size: clamp(1.8rem, 9vw, 2.6rem); font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
<main>
    <h1>{{ $server }}</h1>
    <p>{{ $label }}</p>
    @if ($next_unix)
        <div class="count" id="count" data-at="{{ $next_unix }}">{{ $next_at }}</div>
        <p id="when">{{ $next_local }}</p>
        <p class="zone" id="zone" hidden>{{ $next_local }}</p>
    @else
        <div class="count">No wipe scheduled</div>
    @endif
</main>
@if ($next_unix)
<script>
(function () {
    var el = document.getElementById('count');
    var at = Number(el.dataset.at) * 1000;
    // The visitor's own time; the line under it keeps the server's time zone.
    document.getElementById('when').textContent = new Date(at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) + ' (your time)';
    document.getElementById('zone').hidden = false;
    function tick() {
        var s = Math.max(0, Math.floor((at - Date.now()) / 1000));
        var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
        el.textContent = s === 0 ? 'Wiping now' : (d ? d + 'd ' : '') + h + 'h ' + m + 'm ' + (s % 60) + 's';
    }
    tick();
    setInterval(tick, 1000);
})();
</script>
@endif
</body>
</html>
