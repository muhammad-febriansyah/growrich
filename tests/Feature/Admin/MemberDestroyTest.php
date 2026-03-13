<?php

use App\Enums\Mlm\LegPosition;
use App\Models\MemberProfile;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    // Root member (no parent_id)
    $this->rootUser = User::factory()->create();
    $this->rootProfile = MemberProfile::factory()->for($this->rootUser)->create([
        'parent_id' => null,
        'leg_position' => null,
        'left_pp_total' => 200,
        'right_pp_total' => 150,
        'left_rp_total' => 50,
        'right_rp_total' => 40,
    ]);

    // Child member on left leg
    $this->childUser = User::factory()->create();
    $this->childProfile = MemberProfile::factory()->for($this->childUser)->create([
        'parent_id' => $this->rootProfile->id,
        'leg_position' => LegPosition::Left->value,
    ]);

    // Link root's left_child_id
    $this->rootProfile->update(['left_child_id' => $this->childProfile->id]);
});

it('deletes_a_non_root_member_and_their_data', function () {
    actingAs($this->admin)
        ->delete("/admin/members/{$this->childUser->id}")
        ->assertRedirect('/admin/members');

    expect(User::find($this->childUser->id))->toBeNull();
    expect(MemberProfile::find($this->childProfile->id))->toBeNull();
});

it('resets_parent_left_pp_and_rp_when_left_leg_child_is_deleted', function () {
    actingAs($this->admin)
        ->delete("/admin/members/{$this->childUser->id}");

    $this->rootProfile->refresh();

    expect($this->rootProfile->left_pp_total)->toBe(0)
        ->and($this->rootProfile->left_rp_total)->toBe(0)
        ->and($this->rootProfile->right_pp_total)->toBe(150)
        ->and($this->rootProfile->right_rp_total)->toBe(40);
});

it('resets_parent_right_pp_and_rp_when_right_leg_child_is_deleted', function () {
    $rightChildUser = User::factory()->create();
    $rightChildProfile = MemberProfile::factory()->for($rightChildUser)->create([
        'parent_id' => $this->rootProfile->id,
        'leg_position' => LegPosition::Right->value,
    ]);
    $this->rootProfile->update(['right_child_id' => $rightChildProfile->id]);

    actingAs($this->admin)
        ->delete("/admin/members/{$rightChildUser->id}");

    $this->rootProfile->refresh();

    expect($this->rootProfile->right_pp_total)->toBe(0)
        ->and($this->rootProfile->right_rp_total)->toBe(0)
        ->and($this->rootProfile->left_pp_total)->toBe(200)
        ->and($this->rootProfile->left_rp_total)->toBe(50);
});

it('cannot_delete_root_member', function () {
    actingAs($this->admin)
        ->delete("/admin/members/{$this->rootUser->id}")
        ->assertRedirect();

    expect(User::find($this->rootUser->id))->not->toBeNull();
});

it('redirects_unauthenticated_users', function () {
    $this->delete("/admin/members/{$this->childUser->id}")
        ->assertRedirect('/login');
});
