<?php

use Illuminate\Support\Facades\Route;
use RustixDev\NextWipe\Http\Controllers\ServerWipeController;

// Anyone who can see the server sees the countdown; changing it needs ext.next-wipe.manage.
Route::get('/wipe', [ServerWipeController::class, 'show']);
Route::put('/wipe', [ServerWipeController::class, 'update']);
Route::delete('/wipe', [ServerWipeController::class, 'destroy']);
