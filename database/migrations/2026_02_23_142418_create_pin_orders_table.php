<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pin_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('package_type');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('total_amount');
            $table->string('status')->default('pending'); // pending|completed|cancelled
            $table->string('phone', 20);
            $table->string('shipping_name');
            $table->text('shipping_address');
            $table->string('shipping_province', 100);
            $table->string('shipping_city', 100);
            $table->string('shipping_district', 100);
            $table->string('shipping_village', 100);
            $table->string('shipping_postal_code', 10);
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pin_orders');
    }
};
