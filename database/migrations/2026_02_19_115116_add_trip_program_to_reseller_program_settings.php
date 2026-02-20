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
        Schema::table('reseller_program_settings', function (Blueprint $table) {
            $table->string('trip_title')->nullable()->after('compensation_columns');
            $table->text('trip_description')->nullable()->after('trip_title');
            $table->json('trip_images')->nullable()->after('trip_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reseller_program_settings', function (Blueprint $table) {
            $table->dropColumn(['trip_title', 'trip_description', 'trip_images']);
        });
    }
};
