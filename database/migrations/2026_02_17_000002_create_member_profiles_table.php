<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('package_type');
            $table->string('package_status')->default('inactive');
            $table->string('pin_code');
            $table->timestamp('activated_at')->nullable();
            $table->unsignedBigInteger('left_child_id')->nullable();
            $table->unsignedBigInteger('right_child_id')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('leg_position')->nullable();
            $table->unsignedBigInteger('left_pp_total')->default(0);
            $table->unsignedBigInteger('right_pp_total')->default(0);
            $table->unsignedBigInteger('left_rp_total')->default(0);
            $table->unsignedBigInteger('right_rp_total')->default(0);
            $table->string('career_level')->default('Member');
            $table->timestamps();

            $table->foreign('left_child_id')->references('id')->on('member_profiles')->nullOnDelete();
            $table->foreign('right_child_id')->references('id')->on('member_profiles')->nullOnDelete();
            $table->foreign('parent_id')->references('id')->on('member_profiles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_profiles');
    }
};
