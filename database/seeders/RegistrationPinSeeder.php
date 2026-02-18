<?php

namespace Database\Seeders;

use App\Enums\Mlm\PackageType;
use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RegistrationPinSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $batches = [
            ['package' => PackageType::Silver, 'count' => 10],
            ['package' => PackageType::Gold, 'count' => 10],
            ['package' => PackageType::Platinum, 'count' => 5],
        ];

        foreach ($batches as $batch) {
            for ($i = 0; $i < $batch['count']; $i++) {
                RegistrationPin::create([
                    'pin_code' => strtoupper(Str::random(4)).rand(1000, 9999),
                    'package_type' => $batch['package']->value,
                    'price' => $batch['package']->registrationPrice(),
                    'purchased_by' => $admin?->id,
                    'used_by' => null,
                    'status' => 'available',
                ]);
            }
        }
    }
}
