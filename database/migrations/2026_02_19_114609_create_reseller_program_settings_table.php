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
        Schema::create('reseller_program_settings', function (Blueprint $table) {
            $table->id();
            $table->json('cara_bergabung')->nullable();
            $table->string('compensation_title')->nullable();
            $table->text('compensation_description')->nullable();
            $table->json('compensation_columns')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reseller_program_settings');
    }
};
