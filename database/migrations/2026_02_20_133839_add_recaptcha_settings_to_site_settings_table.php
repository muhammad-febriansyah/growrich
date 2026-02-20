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
            $table->string('nocaptcha_sitekey')->nullable()->after('duitku_is_sandbox');
            $table->string('nocaptcha_secret')->nullable()->after('nocaptcha_sitekey');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['nocaptcha_sitekey', 'nocaptcha_secret']);
        });
    }
};
