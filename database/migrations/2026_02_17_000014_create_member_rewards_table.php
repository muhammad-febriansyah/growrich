<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_milestone_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('qualified_at')->nullable();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();

            $table->unique(['member_profile_id', 'reward_milestone_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_rewards');
    }
};
