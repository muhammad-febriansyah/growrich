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
            $table->string('hero_badge')->nullable()->after('copyright_text');
            $table->string('hero_title')->nullable()->after('hero_badge');
            $table->string('hero_title_highlight')->nullable()->after('hero_title');
            $table->text('hero_description')->nullable()->after('hero_title_highlight');
            $table->string('hero_image')->nullable()->after('hero_description');
            $table->string('hero_stats_value')->nullable()->after('hero_image');
            $table->string('hero_stats_label')->nullable()->after('hero_stats_value');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'hero_badge',
                'hero_title',
                'hero_title_highlight',
                'hero_description',
                'hero_image',
                'hero_stats_value',
                'hero_stats_label',
            ]);
        });
    }
};
