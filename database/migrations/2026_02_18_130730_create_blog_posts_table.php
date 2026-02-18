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
        Schema::create('blog_posts', function (Blueprint $col) {
            $col->id();
            $col->string('title');
            $col->string('slug')->unique();
            $col->text('content');
            $col->text('excerpt')->nullable();
            $col->string('thumbnail')->nullable();
            $col->boolean('is_published')->default(false);
            $col->timestamp('published_at')->nullable();
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
