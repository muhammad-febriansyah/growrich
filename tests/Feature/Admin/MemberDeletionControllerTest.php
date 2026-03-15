<?php

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\LegPosition;
use App\Models\Bonus;
use App\Models\MemberDeletionLog;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use App\Models\RewardPointLedger;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    $this->rootUser = User::factory()->create();
    $this->rootProfile = MemberProfile::factory()->for($this->rootUser)->create([
        'parent_id' => null,
        'leg_position' => null,
        'left_pp_total' => 300,
        'right_pp_total' => 200,
        'left_rp_total' => 80,
        'right_rp_total' => 60,
    ]);

    $this->childUser = User::factory()->create();
    $this->childProfile = MemberProfile::factory()->for($this->childUser)->create([
        'parent_id' => $this->rootProfile->id,
        'leg_position' => LegPosition::Left->value,
    ]);
    $this->rootProfile->update(['left_child_id' => $this->childProfile->id]);
});

it('shows_the_member_deletions_index_page', function () {
    actingAs($this->admin)
        ->get('/admin/member-deletions')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/member-deletions/index'));
});

it('deletes_a_non_root_member_and_logs_the_deletion', function () {
    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$this->childUser->id}")
        ->assertRedirect();

    expect(User::find($this->childUser->id))->toBeNull();

    $log = MemberDeletionLog::first();
    expect($log)->not->toBeNull()
        ->and($log->name)->toBe($this->childUser->name)
        ->and($log->email)->toBe($this->childUser->email)
        ->and($log->deleted_by)->toBe($this->admin->id);
});

it('resets_parent_leg_pp_and_rp_after_deletion', function () {
    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$this->childUser->id}");

    $this->rootProfile->refresh();

    expect($this->rootProfile->left_pp_total)->toBe(0)
        ->and($this->rootProfile->left_rp_total)->toBe(0)
        ->and($this->rootProfile->right_pp_total)->toBe(200)
        ->and($this->rootProfile->right_rp_total)->toBe(60);
});

it('cannot_delete_root_member', function () {
    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$this->rootUser->id}")
        ->assertRedirect();

    expect(User::find($this->rootUser->id))->not->toBeNull();
    expect(MemberDeletionLog::count())->toBe(0);
});

it('index_excludes_root_members_from_member_list', function () {
    actingAs($this->admin)
        ->get('/admin/member-deletions')
        ->assertInertia(fn ($page) => $page
            ->where('members.0.id', $this->childUser->id)
            ->count('members', 1)
        );
});

it('bulk_deletes_multiple_members_and_logs_each', function () {
    $child2 = User::factory()->create();
    $profile2 = MemberProfile::factory()->for($child2)->create([
        'parent_id' => $this->rootProfile->id,
        'leg_position' => LegPosition::Right->value,
    ]);
    $this->rootProfile->update(['right_child_id' => $profile2->id]);

    actingAs($this->admin)
        ->delete('/admin/member-deletions', ['ids' => [$this->childUser->id, $child2->id]])
        ->assertRedirect();

    expect(User::find($this->childUser->id))->toBeNull();
    expect(User::find($child2->id))->toBeNull();
    expect(MemberDeletionLog::count())->toBe(2);
});

it('bulk_delete_skips_root_members', function () {
    actingAs($this->admin)
        ->delete('/admin/member-deletions', ['ids' => [$this->rootUser->id, $this->childUser->id]])
        ->assertRedirect();

    expect(User::find($this->rootUser->id))->not->toBeNull();
    expect(User::find($this->childUser->id))->toBeNull();
    expect(MemberDeletionLog::count())->toBe(1);
});

it('resets_leveling_rewarded_levels_on_parent_after_deletion', function () {
    // Parent has stale leveling_rewarded_levels from old tree
    $this->rootProfile->update(['leveling_rewarded_levels' => [1, 2]]);

    // Create pending leveling bonuses (from old tree)
    Bonus::factory()->create([
        'member_profile_id' => $this->rootProfile->id,
        'bonus_type' => BonusType::Leveling->value,
        'amount' => 250_000,
        'status' => BonusStatus::Pending->value,
        'meta' => ['level' => 1, 'left_pkg' => 'Silver', 'right_pkg' => 'Gold'],
    ]);
    Bonus::factory()->create([
        'member_profile_id' => $this->rootProfile->id,
        'bonus_type' => BonusType::Leveling->value,
        'amount' => 250_000,
        'status' => BonusStatus::Pending->value,
        'meta' => ['level' => 2, 'left_pkg' => 'Silver', 'right_pkg' => 'Silver'],
    ]);

    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$this->childUser->id}");

    $this->rootProfile->refresh();

    // leveling_rewarded_levels should be reset (no approved bonuses)
    expect($this->rootProfile->leveling_rewarded_levels)->toBeNull();

    // Pending leveling bonuses should be deleted
    expect(
        Bonus::where('member_profile_id', $this->rootProfile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(0);
});

it('preserves_approved_leveling_levels_after_deletion', function () {
    $this->rootProfile->update(['leveling_rewarded_levels' => [1, 2]]);

    // Level 1 was already approved
    Bonus::factory()->create([
        'member_profile_id' => $this->rootProfile->id,
        'bonus_type' => BonusType::Leveling->value,
        'amount' => 250_000,
        'status' => BonusStatus::Approved->value,
        'meta' => ['level' => 1, 'left_pkg' => 'Silver', 'right_pkg' => 'Gold'],
    ]);
    // Level 2 is still pending
    Bonus::factory()->create([
        'member_profile_id' => $this->rootProfile->id,
        'bonus_type' => BonusType::Leveling->value,
        'amount' => 250_000,
        'status' => BonusStatus::Pending->value,
        'meta' => ['level' => 2, 'left_pkg' => 'Silver', 'right_pkg' => 'Silver'],
    ]);

    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$this->childUser->id}");

    $this->rootProfile->refresh();

    // Only approved level 1 should remain
    expect($this->rootProfile->leveling_rewarded_levels)->toBe([1]);
});

it('reverses_pp_rp_for_ancestors_above_direct_parent', function () {
    // Build a deeper tree: grandparent → parent → child
    $grandparentUser = User::factory()->create();
    $grandparentProfile = MemberProfile::factory()->for($grandparentUser)->create([
        'parent_id' => null,
        'leg_position' => null,
        'left_pp_total' => 5,
        'right_pp_total' => 3,
        'left_rp_total' => 2,
        'right_rp_total' => 1,
    ]);

    $parentUser = User::factory()->create();
    $parentProfile = MemberProfile::factory()->for($parentUser)->create([
        'parent_id' => $grandparentProfile->id,
        'leg_position' => LegPosition::Left->value,
        'left_pp_total' => 2,
        'right_pp_total' => 0,
        'left_rp_total' => 1,
        'right_rp_total' => 0,
    ]);
    $grandparentProfile->update(['left_child_id' => $parentProfile->id]);

    $leafUser = User::factory()->create();
    $leafProfile = MemberProfile::factory()->for($leafUser)->create([
        'parent_id' => $parentProfile->id,
        'leg_position' => LegPosition::Left->value,
    ]);
    $parentProfile->update(['left_child_id' => $leafProfile->id]);

    // Create ledger entries for the leaf's registration (PP propagated to grandparent)
    PairingPointLedger::create([
        'member_profile_id' => $grandparentProfile->id,
        'leg' => 'left',
        'points' => 2,
        'balance_before' => 3,
        'balance_after' => 5,
        'reason' => 'registration',
        'reference_id' => $leafProfile->id,
        'ledger_date' => now()->toDateString(),
    ]);
    RewardPointLedger::create([
        'member_profile_id' => $grandparentProfile->id,
        'leg' => 'left',
        'points' => 1,
        'balance_before' => 1,
        'balance_after' => 2,
        'reason' => 'registration',
        'reference_id' => $leafProfile->id,
        'ledger_date' => now()->toDateString(),
    ]);

    actingAs($this->admin)
        ->delete("/admin/member-deletions/{$leafUser->id}");

    // Direct parent's left PP/RP should be 0
    $parentProfile->refresh();
    expect($parentProfile->left_pp_total)->toBe(0)
        ->and($parentProfile->left_rp_total)->toBe(0);

    // Grandparent's left PP/RP should be reduced by leaf's contribution
    $grandparentProfile->refresh();
    expect($grandparentProfile->left_pp_total)->toBe(3)  // 5 - 2
        ->and($grandparentProfile->left_rp_total)->toBe(1)   // 2 - 1
        ->and($grandparentProfile->right_pp_total)->toBe(3)   // unchanged
        ->and($grandparentProfile->right_rp_total)->toBe(1);  // unchanged
});
