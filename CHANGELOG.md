# Changelog

## 1.2.0

- Works with Pterodactyl v2.0.0-beta.1 (SDK beta.6).
- On phones the console card's buttons now wrap below the wipe time instead of squeezing it.

## 1.1.0

- Works with Wipe & Season Manager. When that extension is installed and the server has an enabled plan, the countdown, the public page and its Discord link preview show that plan's next wipe, name and time zone, so they always match the Wipes tab. Skipping a wipe or changing a plan there updates them too. Without a plan, Next Wipe uses its own schedule as before.
- While a plan drives the countdown, the Edit button is replaced by a Wipes button that opens the server's Wipes tab, and a Public page button that turns the public page on or off.
- Each schedule now has a time zone. A 19:00 London wipe stays at 19:00 London time when the clocks change. New schedules start in your browser's time zone; existing schedules keep UTC until you change them.
- Subusers with Wipe & Season Manager's manage permission can now change the wipe schedule too.
- The console card matches the other console blocks: one row, standard buttons and spacing.
- The public page shows the wipe time in the server's time zone as well as the visitor's, and includes a link preview for Discord. Its JSON adds `timezone` and `next_local`.

## 1.0.0

- First release.
