<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('career_levels', function (Blueprint $col) {
            $col->id();
            $col->string('key')->unique();
            $col->string('label');
            $col->integer('required_pp')->default(0);
            $col->decimal('global_share_percent', 5, 2)->default(0);
            $col->integer('sort_order')->default(0);
            $col->string('dot_color')->nullable();
            $col->string('text_color')->nullable();
            $col->boolean('is_active')->default(true);
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_levels');
    }
};
