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
            $table->unsignedInteger('shipping_cost')->default(0)->after('shipping_postal_code');
            $table->string('shipping_service', 100)->nullable()->after('shipping_cost');
            $table->string('shipping_etd', 50)->nullable()->after('shipping_service');
            $table->string('biteship_area_id', 100)->nullable()->after('shipping_etd');
        });
    }

    public function down(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_cost', 'shipping_service', 'shipping_etd', 'biteship_area_id']);
        });
    }
};
