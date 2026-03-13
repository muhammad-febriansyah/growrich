<?php

use App\Enums\Mlm\LegPosition;
use App\Models\MemberDeletionLog;
use App\Models\MemberProfile;
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
