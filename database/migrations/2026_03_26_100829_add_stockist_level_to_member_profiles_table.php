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
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->string('stockist_level')->nullable()->after('is_stockist'); // center, point, sub
            $table->foreignId('stockist_parent_id')->nullable()->after('stockist_level')
                ->constrained('member_profiles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->dropForeign(['stockist_parent_id']);
            $table->dropColumn(['stockist_level', 'stockist_parent_id']);
        });
    }
};
