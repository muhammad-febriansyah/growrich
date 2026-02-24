<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->string('payment_receipt', 500)->nullable()->after('payment_url');
        });

        Schema::table('repeat_orders', function (Blueprint $table) {
            $table->string('payment_receipt', 500)->nullable()->after('payment_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->dropColumn('payment_receipt');
        });

        Schema::table('repeat_orders', function (Blueprint $table) {
            $table->dropColumn('payment_receipt');
        });
    }
};
