<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();

            // ── General ───────────────────────────────────────────────────────
            $table->string('site_name')->default('GrowRich');
            $table->string('site_tagline')->nullable();
            $table->text('site_description')->nullable();

            // ── Branding ──────────────────────────────────────────────────────
            $table->string('logo')->nullable();
            $table->string('logo_dark')->nullable();
            $table->string('favicon')->nullable();

            // ── SEO ───────────────────────────────────────────────────────────
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('og_image')->nullable();

            // ── Contact ───────────────────────────────────────────────────────
            $table->string('contact_phone')->nullable();
            $table->string('contact_whatsapp')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('contact_address')->nullable();

            // ── Social Media ──────────────────────────────────────────────────
            $table->string('social_facebook')->nullable();
            $table->string('social_instagram')->nullable();
            $table->string('social_twitter')->nullable();
            $table->string('social_youtube')->nullable();
            $table->string('social_tiktok')->nullable();

            // ── Google ────────────────────────────────────────────────────────
            $table->string('google_maps_url')->nullable();
            $table->text('google_maps_embed')->nullable();
            $table->string('google_analytics_id')->nullable();

            // ── Footer ────────────────────────────────────────────────────────
            $table->text('footer_text')->nullable();
            $table->string('copyright_text')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
