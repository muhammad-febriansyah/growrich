<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            // Data Pribadi
            $table->date('birth_date')->nullable()->after('career_level');
            $table->string('birth_place')->nullable()->after('birth_date');
            $table->string('gender')->nullable()->after('birth_place');
            $table->string('marital_status')->nullable()->after('gender');
            $table->string('nationality')->nullable()->default('Indonesia')->after('marital_status');
            $table->string('id_number')->nullable()->after('nationality');
            $table->text('address')->nullable()->after('id_number');
            $table->string('province')->nullable()->after('address');
            $table->string('city')->nullable()->after('province');
            $table->string('district')->nullable()->after('city');
            $table->string('village')->nullable()->after('district');
            $table->string('postal_code')->nullable()->after('village');

            // Rekening Bank
            $table->string('bank_name')->nullable()->after('postal_code');
            $table->string('bank_branch')->nullable()->after('bank_name');
            $table->string('bank_account_number')->nullable()->after('bank_branch');
            $table->string('bank_account_name')->nullable()->after('bank_account_number');

            // Data Ahli Waris
            $table->string('beneficiary_name')->nullable()->after('bank_account_name');
            $table->string('beneficiary_relationship')->nullable()->after('beneficiary_name');
            $table->string('beneficiary_id_number')->nullable()->after('beneficiary_relationship');
            $table->string('beneficiary_phone')->nullable()->after('beneficiary_id_number');
        });
    }

    public function down(): void
    {
        Schema::table('member_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date', 'birth_place', 'gender', 'marital_status', 'nationality',
                'id_number', 'address', 'province', 'city', 'district', 'village', 'postal_code',
                'bank_name', 'bank_branch', 'bank_account_number', 'bank_account_name',
                'beneficiary_name', 'beneficiary_relationship', 'beneficiary_id_number', 'beneficiary_phone',
            ]);
        });
    }
};
