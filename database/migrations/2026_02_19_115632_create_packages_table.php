<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();            // 'Silver', 'Gold', 'Platinum'
            $table->string('name');
            $table->unsignedSmallInteger('sort_order')->unique();
            $table->unsignedSmallInteger('pairing_point');
            $table->unsignedSmallInteger('reward_point');
            $table->unsignedSmallInteger('max_pairing_per_day');
            $table->unsignedBigInteger('registration_price');
            $table->unsignedBigInteger('upgrade_price')->nullable();
            $table->unsignedInteger('sponsor_bonus_unit');    // e.g. 200_000
            $table->unsignedInteger('leveling_bonus_amount'); // e.g. 250_000, 500_000, 750_000
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
