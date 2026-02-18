<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repeat_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_profile_id')->constrained()->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('total_amount');
            $table->string('status')->default('pending');
            $table->unsignedTinyInteger('period_month');
            $table->unsignedSmallInteger('period_year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repeat_orders');
    }
};
