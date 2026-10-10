<?php

namespace RustixDev\NextWipe;

use Pterodactyl\Extensions\ExtensionProvider;

class NextWipeProvider extends ExtensionProvider
{
    public function boot(): void
    {
        // routes/server.php: read and set a server's wipe schedule.
        $this->registerApiRoutes();
        // routes/web.php: the opt-in public countdown page, no sign-in needed.
        $this->registerWebRoutes(__DIR__.'/../routes/web.php');
        $this->loadExtensionViews();

        $this->registerPermissions('Next Wipe', [
            'manage' => 'Set the server\'s wipe schedule and turn its public page on or off.',
        ]);
    }
}
