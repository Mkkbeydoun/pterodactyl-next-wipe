# Next Wipe

Show a countdown to each server's next wipe on its console page, with an optional public page for Discord and websites.

## Features

- **Countdown on the console page**: "Map wipe · Every week · Europe/London, in 3d 4h 12m" with the date in each viewer's own time zone, and in the schedule's time zone when that is different. Everyone who can see the server sees it.
- **Repeating schedules**: once, every week, every two weeks, every month on the same day, or the first Thursday of each month (Rust's forced wipe). The next wipe is worked out automatically.
- **Time zones**: each schedule has its own time zone (new ones start in your browser's), and the wipe stays at the same local time when the clocks change for daylight saving.
- **Works with Wipe & Season Manager**: when that extension is installed and the server has an enabled wipe plan, the countdown, the public page and its Discord preview follow the plan's next wipe (the earliest one when there are several), with its name and time zone. Skipping or running a wipe there updates them. The Edit button becomes a **Wipes** button that opens the server's Wipes tab, and a **Public page** button turns the public page on or off. With no plan, Next Wipe uses its own schedule.
- **Subuser permission**: owners can manage the schedule, and subusers need the **Next Wipe → manage** or **Wipe & Season Manager → manage** permission to change it.
- **Public page (opt-in)**: a link anyone can open, for Discord or your website, showing only the server name and wipe time. Pasted into Discord it shows a preview with the next wipe. It can be embedded in an iframe, and adding `?format=json` returns the time for bots (`next_at`, `next_unix`, `timezone`, `next_local`). Turning the page off makes the link stop working; turning it back on restores the same link.

## API

| Method | Path | Who |
|---|---|---|
| GET | `/api/client/servers/{server}/extensions/next-wipe/wipe` | Anyone who can see the server |
| PUT, DELETE | `/api/client/servers/{server}/extensions/next-wipe/wipe` | Owner, admins, subusers with `ext.next-wipe.manage` or `ext.wipe-season-manager.manage` |
| PUT | `/api/client/servers/{server}/extensions/next-wipe/wipe/public` | Same as above; turns only the public page on or off |
| GET | `/extensions/next-wipe/s/{token}` | Anyone, when the server's public page is on (`?format=json` for JSON) |

## Requirements

- Pterodactyl Panel 2.0 (2.0-develop or later)
- PHP 8.3+

## Install

1. Download `next-wipe-<version>.pteroext` from the [latest release](https://github.com/Rustix-Development/pterodactyl-next-wipe/releases/latest).
2. In the panel, open **Admin → Extensions**, upload the file and enable it.
3. Reload the panel.

From a terminal instead:

```sh
php artisan p:extension:install /path/to/next-wipe-<version>.pteroext --enable
```

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

Remove it under **Admin → Extensions**, or from a terminal:

```sh
php artisan p:extension:remove next-wipe
```

## License

MIT. See [LICENSE](LICENSE).

This is a community extension and is not affiliated with or endorsed by Pterodactyl.
