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
            $table->string('duitku_merchant_code')->nullable()->after('email_token');
            $table->string('duitku_api_key')->nullable()->after('duitku_merchant_code');
            $table->boolean('duitku_is_sandbox')->default(true)->after('duitku_api_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['duitku_merchant_code', 'duitku_api_key', 'duitku_is_sandbox']);
        });
    }
};
