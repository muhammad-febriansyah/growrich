<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->string('shipping_courier')->nullable()->after('shipped_at');
            $table->string('shipping_tracking_number')->nullable()->after('shipping_courier');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_courier', 'shipping_tracking_number']);
        });
    }
};
