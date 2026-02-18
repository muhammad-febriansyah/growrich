<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->string('referral_code')->unique()->nullable()->after('avatar');
            $table->foreignId('sponsor_id')->nullable()->constrained('users')->nullOnDelete()->after('referral_code');
            $table->string('role')->default('member')->after('sponsor_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['sponsor_id']);
            $table->dropColumn(['phone', 'avatar', 'referral_code', 'sponsor_id', 'role']);
        });
    }
};
