<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('status'); // duitku | manual_transfer
            $table->text('payment_url')->nullable()->after('payment_method');
            $table->string('duitku_reference')->nullable()->after('payment_url');
            $table->timestamp('paid_at')->nullable()->after('duitku_reference');
        });
    }

    public function down(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_url', 'duitku_reference', 'paid_at']);
        });
    }
};
