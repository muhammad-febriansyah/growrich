<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_bonus_runs', function (Blueprint $table) {
            $table->id();
            $table->date('run_date')->unique();
            $table->string('status')->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('total_pairing_bonus')->default(0);
            $table->unsignedBigInteger('total_matching_bonus')->default(0);
            $table->unsignedBigInteger('total_leveling_bonus')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_bonus_runs');
    }
};
