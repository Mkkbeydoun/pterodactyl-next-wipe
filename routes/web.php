<?php

use Illuminate\Support\Facades\Route;
use RustixDev\NextWipe\Http\Controllers\PublicWipeController;

Route::get('/s/{token}', [PublicWipeController::class, 'show'])
    ->where('token', '[A-Za-z0-9]{32}')
    ->middleware('throttle:60,1');
