<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_milestones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('reward_type');
            $table->unsignedBigInteger('required_left_rp');
            $table->unsignedBigInteger('required_right_rp');
            $table->unsignedBigInteger('cash_value');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_milestones');
    }
};
