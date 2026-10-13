<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ext_next_wipe_schedules', function (Blueprint $table) {
            // The calendar is read in this zone, so a 19:00 wipe stays at 19:00 local time across daylight saving.
            $table->string('timezone', 64)->default('UTC')->after('repeat');
        });
    }

    public function down(): void
    {
        Schema::table('ext_next_wipe_schedules', function (Blueprint $table) {
            $table->dropColumn('timezone');
        });
    }
};
