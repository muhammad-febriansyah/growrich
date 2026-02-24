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
        Schema::create('marketing_bonuses', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // e.g., 'daily', 'monthly'
            $table->string('icon');
            $table->string('icon_color')->nullable();
            $table->string('tag')->nullable();
            $table->string('tag_color')->nullable();
            $table->string('title');
            $table->text('description');
            $table->json('details')->nullable(); // For the lists/tables inside the card
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_bonuses');
    }
};
