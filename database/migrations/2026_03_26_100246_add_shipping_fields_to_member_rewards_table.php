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
        Schema::table('member_rewards', function (Blueprint $table) {
            $table->timestamp('claimed_at')->nullable()->after('fulfilled_at');
            $table->string('recipient_name')->nullable()->after('claimed_at');
            $table->string('recipient_phone')->nullable()->after('recipient_name');
            $table->text('recipient_address')->nullable()->after('recipient_phone');
            $table->string('courier')->nullable()->after('recipient_address');
            $table->string('tracking_number')->nullable()->after('courier');
            $table->text('shipping_notes')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('shipping_notes');
        });
    }

    public function down(): void
    {
        Schema::table('member_rewards', function (Blueprint $table) {
            $table->dropColumn([
                'claimed_at', 'recipient_name', 'recipient_phone', 'recipient_address',
                'courier', 'tracking_number', 'shipping_notes', 'shipped_at',
            ]);
        });
    }
};
