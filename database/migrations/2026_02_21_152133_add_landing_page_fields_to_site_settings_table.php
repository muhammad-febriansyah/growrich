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
            $table->string('hero_title_suffix')->nullable()->after('hero_title_highlight');

            // Features Section
            $table->string('features_section_badge')->nullable();
            $table->string('features_section_title')->nullable();
            $table->string('features_section_highlight')->nullable();
            $table->text('features_section_description')->nullable();

            // Packages Section
            $table->string('packages_section_badge')->nullable();
            $table->string('packages_section_title')->nullable();
            $table->string('packages_section_highlight')->nullable();
            $table->text('packages_section_description')->nullable();

            // Marketing Section
            $table->string('marketing_section_badge')->nullable();
            $table->string('marketing_section_title')->nullable();
            $table->string('marketing_section_highlight')->nullable();
            $table->text('marketing_section_description')->nullable();

            // Career Section
            $table->string('career_section_title')->nullable();
            $table->string('career_section_highlight')->nullable();
            $table->text('career_section_description')->nullable();

            // Steps Section
            $table->string('steps_section_badge')->nullable();
            $table->string('steps_section_title')->nullable();
            $table->string('steps_section_highlight')->nullable();
            $table->text('steps_section_description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'hero_title_suffix',
                'features_section_badge',
                'features_section_title',
                'features_section_highlight',
                'features_section_description',
                'packages_section_badge',
                'packages_section_title',
                'packages_section_highlight',
                'packages_section_description',
                'marketing_section_badge',
                'marketing_section_title',
                'marketing_section_highlight',
                'marketing_section_description',
                'career_section_title',
                'career_section_highlight',
                'career_section_description',
                'steps_section_badge',
                'steps_section_title',
                'steps_section_highlight',
                'steps_section_description',
            ]);
        });
    }
};
