<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('left_pp_cumulative')->default(0)->after('right_pp_total');
            $table->unsignedBigInteger('right_pp_cumulative')->default(0)->after('left_pp_cumulative');
        });

        // Backfill cumulative values from the pairing_point_ledger (source of truth)
        DB::statement(<<<'SQL'
            UPDATE member_profiles
            SET
                left_pp_cumulative = (
                    SELECT COALESCE(SUM(points), 0)
                    FROM pairing_point_ledger
                    WHERE member_profile_id = member_profiles.id AND leg = 'left'
                ),
                right_pp_cumulative = (
                    SELECT COALESCE(SUM(points), 0)
                    FROM pairing_point_ledger
                    WHERE member_profile_id = member_profiles.id AND leg = 'right'
                )
        SQL);

        // Recalculate career levels based on cumulative PP (smaller leg)
        // Uses CASE instead of LEAST() for SQLite/MySQL compatibility
        DB::statement(<<<'SQL'
            UPDATE member_profiles
            SET career_level = CASE
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 25000 THEN 'EliteTeamGlobal'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 10000 THEN 'BlueDiamondManager'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 5000  THEN 'DiamondManager'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 1000  THEN 'EmeraldManager'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 500   THEN 'RubyManager'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 100   THEN 'SapphireManager'
                WHEN (CASE WHEN left_pp_cumulative < right_pp_cumulative THEN left_pp_cumulative ELSE right_pp_cumulative END) >= 25    THEN 'CoreLoader'
                ELSE 'Member'
            END
        SQL);
    }

    public function down(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->dropColumn(['left_pp_cumulative', 'right_pp_cumulative']);
        });
    }
};
