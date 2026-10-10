<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ext_next_wipe_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('server_id')->unique();
            $table->string('label', 60)->default('Wipe');
            $table->timestamp('anchor_at');
            $table->string('repeat', 16)->default('none');
            $table->boolean('public')->default(false);
            $table->string('public_token', 32)->nullable()->unique();
            $table->timestamps();

            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_next_wipe_schedules');
    }
};
