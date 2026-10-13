Show a countdown to each server's next wipe on its console page, with an optional public page for Discord and websites.

When Wipe & Season Manager is installed and a server has an enabled wipe plan, the countdown, the public page and its Discord preview follow that plan. Each schedule has its own time zone, so wipes stay at the same local time across daylight saving. See the changelog for everything in this release.

## Install

Download `next-wipe-${VERSION}.pteroext` below, then upload it under **Admin → Extensions** and enable it. From a terminal instead:

```sh
php artisan p:extension:install /path/to/next-wipe-${VERSION}.pteroext --enable
```

Requires Pterodactyl Panel 2.0 (2.0-develop or later) and PHP 8.3+. See the README for features and settings.

This is a community extension and is not affiliated with or endorsed by Pterodactyl.
