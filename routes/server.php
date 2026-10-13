<?php

use Illuminate\Support\Facades\Route;
use RustixDev\NextWipe\Http\Controllers\ServerWipeController;

// Anyone who can see the server sees the countdown; changing it needs
// ext.next-wipe.manage or ext.wipe-season-manager.manage.
Route::get('/wipe', [ServerWipeController::class, 'show']);
Route::put('/wipe', [ServerWipeController::class, 'update']);
Route::put('/wipe/public', [ServerWipeController::class, 'updatePublic']);
Route::delete('/wipe', [ServerWipeController::class, 'destroy']);
