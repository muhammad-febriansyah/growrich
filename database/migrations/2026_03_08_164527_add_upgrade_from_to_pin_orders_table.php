<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->string('upgrade_from')->nullable()->after('package_type');
        });
    }

    public function down(): void
    {
        Schema::table('pin_orders', function (Blueprint $table) {
            $table->dropColumn('upgrade_from');
        });
    }
};
