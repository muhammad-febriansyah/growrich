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
        Schema::table('site_settings', function (Blueprint $table) {
            // Diskon harga PIN untuk Stokis (dalam persen, 0 = tidak ada diskon)
            $table->unsignedTinyInteger('stockist_discount_percent')->default(0)->after('duitku_is_sandbox');
            // Diskon volume PIN (beli 5+ dan 10+ PIN)
            $table->unsignedTinyInteger('volume_discount_5_percent')->default(0)->after('stockist_discount_percent');
            $table->unsignedTinyInteger('volume_discount_10_percent')->default(0)->after('volume_discount_5_percent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['stockist_discount_percent', 'volume_discount_5_percent', 'volume_discount_10_percent']);
        });
    }
};
