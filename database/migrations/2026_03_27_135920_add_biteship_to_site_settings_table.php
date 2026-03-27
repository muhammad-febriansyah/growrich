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
            $table->string('biteship_api_key')->nullable()->after('duitku_is_sandbox');
            $table->string('biteship_origin_postal_code', 10)->nullable()->after('biteship_api_key');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['biteship_api_key', 'biteship_origin_postal_code']);
        });
    }
};
