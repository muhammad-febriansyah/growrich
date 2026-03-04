<?php

use App\Enums\Mlm\BonusType;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\RepeatOrder;
use App\Models\User;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\artisan;

beforeEach(function () {
    Mail::fake();
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
});

it('repeat_order_bonus_g1_gets_5_percent_of_downline_ro', function () {
    // Rantai rekrut: sponsorUser → downlineUser
    $sponsorUser = User::factory()->create();
    $downlineUser = User::factory()->withSponsor($sponsorUser->id)->create();

    $sponsor = MemberProfile::factory()->silver()->for($sponsorUser)->create();
    $downline = MemberProfile::factory()->silver()->for($downlineUser)->create();

    // Downline punya RO 2.000.000 di bulan Januari 2026
    RepeatOrder::factory()->completed()->forPeriod(1, 2026)->for($downline)->create(['total_amount' => 2_000_000]);

    artisan('bonus:run-monthly', ['month' => 1, 'year' => 2026])->assertSuccessful();

    // G1 sponsor harus dapat 5% dari 2.000.000 = 100.000
    $bonus = Bonus::where('member_profile_id', $sponsor->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(100_000)
        ->and($bonus->meta['generation'])->toBe(1)
        ->and($bonus->meta['source_profile_id'])->toBe($downline->id);
});

it('repeat_order_bonus_distributes_to_multi_generation_via_sponsor_chain', function () {
    // Rantai rekrut: romeo → A → B
    $romeoUser = User::factory()->create();
    $aUser = User::factory()->withSponsor($romeoUser->id)->create();
    $bUser = User::factory()->withSponsor($aUser->id)->create();

    $romeo = MemberProfile::factory()->silver()->for($romeoUser)->create();
    $a = MemberProfile::factory()->silver()->for($aUser)->create();
    $b = MemberProfile::factory()->silver()->for($bUser)->create();

    // B punya RO 1.000.000
    RepeatOrder::factory()->completed()->forPeriod(2, 2026)->for($b)->create(['total_amount' => 1_000_000]);

    artisan('bonus:run-monthly', ['month' => 2, 'year' => 2026])->assertSuccessful();

    // A (G1 dari B) → 5% × 1.000.000 = 50.000
    $bonusA = Bonus::where('member_profile_id', $a->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    // Romeo (G2 dari B) → 5% × 1.000.000 = 50.000
    $bonusRomeo = Bonus::where('member_profile_id', $romeo->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonusA)->not->toBeNull()
        ->and($bonusA->amount)->toBe(50_000)
        ->and($bonusA->meta['generation'])->toBe(1);

    expect($bonusRomeo)->not->toBeNull()
        ->and($bonusRomeo->amount)->toBe(50_000)
        ->and($bonusRomeo->meta['generation'])->toBe(2);
});

it('repeat_order_bonus_uses_sponsor_chain_not_binary_tree', function () {
    // Romeo rekrut F langsung (G1), tapi F ditempatkan jauh dalam binary tree (di bawah A)
    $romeoUser = User::factory()->create();
    $aUser = User::factory()->create(); // A bukan rekrutan Romeo
    $fUser = User::factory()->withSponsor($romeoUser->id)->create(); // F disponsori Romeo

    $romeo = MemberProfile::factory()->silver()->for($romeoUser)->create();
    $a = MemberProfile::factory()->silver()->for($aUser)->create(['parent_id' => $romeo->id]);
    $f = MemberProfile::factory()->silver()->for($fUser)->create(['parent_id' => $a->id]);

    RepeatOrder::factory()->completed()->forPeriod(3, 2026)->for($f)->create(['total_amount' => 1_000_000]);

    artisan('bonus:run-monthly', ['month' => 3, 'year' => 2026])->assertSuccessful();

    // Romeo (sponsor langsung F = G1) dapat 5% = 50.000
    $bonusRomeo = Bonus::where('member_profile_id', $romeo->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonusRomeo)->not->toBeNull()
        ->and($bonusRomeo->amount)->toBe(50_000)
        ->and($bonusRomeo->meta['generation'])->toBe(1);

    // A tidak dapat bonus (bukan sponsor F)
    $bonusA = Bonus::where('member_profile_id', $a->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonusA)->toBeNull();
});

it('repeat_order_bonus_stops_at_generation_7', function () {
    // Buat rantai sponsor 8 level
    $users = collect();
    $previousSponsorId = null;
    for ($i = 0; $i <= 7; $i++) {
        $user = User::factory()->create(['sponsor_id' => $previousSponsorId]);
        $users->push($user);
        $previousSponsorId = $user->id;
    }

    $profiles = $users->map(fn ($user) => MemberProfile::factory()->silver()->for($user)->create());

    // User terakhir (index 7) punya RO
    RepeatOrder::factory()->completed()->forPeriod(4, 2026)->for($profiles->last())->create(['total_amount' => 1_000_000]);

    artisan('bonus:run-monthly', ['month' => 4, 'year' => 2026])->assertSuccessful();

    // Harus ada maksimal 7 bonus RepeatOrder (G1-G7)
    $count = Bonus::where('bonus_type', BonusType::RepeatOrder->value)->count();
    expect($count)->toBeLessThanOrEqual(7);

    // G7 (index 0) harus dapat bonus
    $g7Profile = $profiles->first();
    $bonusG7 = Bonus::where('member_profile_id', $g7Profile->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonusG7)->not->toBeNull();
});

it('repeat_order_bonus_is_idempotent', function () {
    $sponsorUser = User::factory()->create();
    $downlineUser = User::factory()->withSponsor($sponsorUser->id)->create();

    MemberProfile::factory()->silver()->for($sponsorUser)->create();
    $downline = MemberProfile::factory()->silver()->for($downlineUser)->create();

    RepeatOrder::factory()->completed()->forPeriod(5, 2026)->for($downline)->create(['total_amount' => 1_000_000]);

    artisan('bonus:run-monthly', ['month' => 5, 'year' => 2026])->assertSuccessful();
    artisan('bonus:run-monthly', ['month' => 5, 'year' => 2026])->assertSuccessful();

    // Tidak boleh ada duplikasi bonus di periode yang sama
    expect(Bonus::where('bonus_type', BonusType::RepeatOrder->value)->count())->toBe(1);
});

it('repeat_order_bonus_aggregates_multiple_ros_per_member', function () {
    $sponsorUser = User::factory()->create();
    $downlineUser = User::factory()->withSponsor($sponsorUser->id)->create();

    $sponsor = MemberProfile::factory()->silver()->for($sponsorUser)->create();
    $downline = MemberProfile::factory()->silver()->for($downlineUser)->create();

    // Downline punya 2 RO di bulan yang sama → total 3.000.000
    RepeatOrder::factory()->completed()->forPeriod(6, 2026)->for($downline)->create(['total_amount' => 1_000_000]);
    RepeatOrder::factory()->completed()->forPeriod(6, 2026)->for($downline)->create(['total_amount' => 2_000_000]);

    artisan('bonus:run-monthly', ['month' => 6, 'year' => 2026])->assertSuccessful();

    // Sponsor dapat 5% dari total 3.000.000 = 150.000
    $bonus = Bonus::where('member_profile_id', $sponsor->id)
        ->where('bonus_type', BonusType::RepeatOrder->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(150_000);
});
