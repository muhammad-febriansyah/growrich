<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pairing_point_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_profile_id')->constrained()->cascadeOnDelete();
            $table->string('leg');
            $table->unsignedBigInteger('points');
            $table->unsignedBigInteger('balance_before');
            $table->unsignedBigInteger('balance_after');
            $table->string('reason');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->date('ledger_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pairing_point_ledger');
    }
};
