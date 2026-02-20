<?php

use App\Models\Package;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    // Ensure packages exist (they are seeded via PackageSeeder in production
    // but tests use an empty DB, so we create them here)
    $this->silver = Package::create([
        'key' => 'Silver',
        'name' => 'Silver',
        'sort_order' => 1,
        'pairing_point' => 1,
        'reward_point' => 0,
        'max_pairing_per_day' => 10,
        'registration_price' => 2_450_000,
        'upgrade_price' => 2_450_000,
        'sponsor_bonus_unit' => 200_000,
        'leveling_bonus_amount' => 250_000,
    ]);
});

// ── Index ─────────────────────────────────────────────────────────────────────

it('admin_can_list_packages', function () {
    actingAs($this->admin)
        ->get('/admin/packages')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/packages/index')->has('packages', 1));
});

it('guest_cannot_access_packages_index', function () {
    $this->get('/admin/packages')->assertRedirect();
});

// ── Create / Store ────────────────────────────────────────────────────────────

it('admin_can_create_a_new_package', function () {
    actingAs($this->admin)
        ->post('/admin/packages', [
            'key' => 'Gold',
            'name' => 'Gold',
            'sort_order' => 2,
            'pairing_point' => 2,
            'reward_point' => 1,
            'max_pairing_per_day' => 20,
            'registration_price' => 4_900_000,
            'upgrade_price' => 2_450_000,
            'sponsor_bonus_unit' => 200_000,
            'leveling_bonus_amount' => 500_000,
        ])
        ->assertRedirect('/admin/packages');

    expect(Package::where('key', 'Gold')->exists())->toBeTrue();
});

it('store_validates_required_fields', function () {
    actingAs($this->admin)
        ->post('/admin/packages', [])
        ->assertSessionHasErrors(['key', 'name', 'sort_order', 'registration_price']);
});

it('store_rejects_duplicate_key', function () {
    actingAs($this->admin)
        ->post('/admin/packages', [
            'key' => 'Silver', // already exists
            'name' => 'Dup Silver',
            'sort_order' => 99,
            'pairing_point' => 1,
            'reward_point' => 0,
            'max_pairing_per_day' => 10,
            'registration_price' => 100,
            'upgrade_price' => null,
            'sponsor_bonus_unit' => 100,
            'leveling_bonus_amount' => 100,
        ])
        ->assertSessionHasErrors(['key']);
});

// ── Update ────────────────────────────────────────────────────────────────────

it('admin_can_update_a_package', function () {
    actingAs($this->admin)
        ->put("/admin/packages/{$this->silver->id}", [
            'key' => 'Silver',
            'name' => 'Silver Pro',
            'sort_order' => 1,
            'pairing_point' => 1,
            'reward_point' => 0,
            'max_pairing_per_day' => 15,
            'registration_price' => 3_000_000,
            'upgrade_price' => 2_000_000,
            'sponsor_bonus_unit' => 200_000,
            'leveling_bonus_amount' => 300_000,
        ])
        ->assertRedirect('/admin/packages');

    expect($this->silver->fresh()->name)->toBe('Silver Pro')
        ->and($this->silver->fresh()->registration_price)->toBe(3_000_000);
});

// ── Destroy ───────────────────────────────────────────────────────────────────

it('admin_can_delete_an_unused_package', function () {
    // Create a standalone unused package
    $unused = Package::create([
        'key' => 'Bronze',
        'name' => 'Bronze',
        'sort_order' => 0,
        'pairing_point' => 0,
        'reward_point' => 0,
        'max_pairing_per_day' => 5,
        'registration_price' => 500_000,
        'upgrade_price' => null,
        'sponsor_bonus_unit' => 100_000,
        'leveling_bonus_amount' => 100_000,
    ]);

    actingAs($this->admin)
        ->delete("/admin/packages/{$unused->id}")
        ->assertRedirect('/admin/packages');

    expect(Package::find($unused->id))->toBeNull();
});

it('admin_cannot_delete_a_package_with_members', function () {
    // Simulate members by creating a MemberProfile with this package key
    $member = User::factory()->create();
    \App\Models\MemberProfile::factory()->for($member)->create([
        'package_type' => $this->silver->key,
    ]);

    actingAs($this->admin)
        ->delete("/admin/packages/{$this->silver->id}")
        ->assertRedirect();

    expect(Package::find($this->silver->id))->not->toBeNull();
});
