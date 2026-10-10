# Next Wipe

Show a countdown to each server's next wipe on its console page, with an optional public page for Discord and websites.

## Features

- **Countdown on the console page**: "Map wipe · Every week, in 3d 4h 12m" with the date in each viewer's own time zone. Everyone who can see the server sees it.
- **Repeating schedules**: once, every week, every two weeks, every month on the same day, or the first Thursday of each month (Rust's forced wipe). The next wipe is worked out automatically.
- **Subuser permission**: owners can manage the schedule, and subusers need the **Next Wipe → manage** permission to change it.
- **Public page (opt-in)**: a link anyone can open, for Discord or your website, showing only the server name and wipe time. It can be embedded in an iframe, and adding `?format=json` returns the time for bots. Turning the page off makes the link stop working; turning it back on restores the same link.

## API

| Method | Path | Who |
|---|---|---|
| GET | `/api/client/servers/{server}/extensions/next-wipe/wipe` | Anyone who can see the server |
| PUT, DELETE | `/api/client/servers/{server}/extensions/next-wipe/wipe` | Owner, admins, subusers with `ext.next-wipe.manage` |
| GET | `/extensions/next-wipe/s/{token}` | Anyone, when the server's public page is on (`?format=json` for JSON) |

## Requirements

- Pterodactyl Panel 2.0 (2.0-develop or later)
- PHP 8.3+

## Install

From a release archive (`next-wipe-1.0.0.pteroext`):

```sh
php artisan p:extension:install /path/to/next-wipe-1.0.0.pteroext --enable
```

Or upload the archive under **Admin → Extensions**. Reload the panel afterwards.

## Build from source

```sh
npm install
npm run typecheck
npm test
npm run build
php artisan p:extension:doctor /path/to/next-wipe
php artisan p:extension:pack /path/to/next-wipe
```

## Uninstall

```sh
php artisan p:extension:remove next-wipe
```
