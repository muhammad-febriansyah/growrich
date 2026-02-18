<?php

use App\Models\MemberProfile;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user    = User::factory()->create();
    $this->profile = MemberProfile::factory()->for($this->user)->create();
});

it('renders the network page for an authenticated member', function () {
    actingAs($this->user)
        ->get('/member/network')
        ->assertInertia(fn ($page) => $page
            ->component('member/network/index')
            ->has('tree')
            ->has('ancestors')
            ->where('ancestors', [])
        );
});

it('redirects unauthenticated users', function () {
    $this->get('/member/network')->assertRedirect('/login');
});

it('shows null tree and empty ancestors when member has no profile', function () {
    $userWithoutProfile = User::factory()->create();

    actingAs($userWithoutProfile)
        ->get('/member/network')
        ->assertInertia(fn ($page) => $page
            ->where('tree', null)
            ->where('ancestors', [])
        );
});

it('includes the root profile data in the tree', function () {
    actingAs($this->user)
        ->get('/member/network')
        ->assertInertia(fn ($page) => $page
            ->where('tree.id', $this->profile->id)
            ->where('tree.name', $this->user->name)
        );
});

it('drills into a downline subtree when given a valid root_id', function () {
    $child = MemberProfile::factory()->create([
        'parent_id' => $this->profile->id,
    ]);
    $this->profile->update(['left_child_id' => $child->id]);

    actingAs($this->user)
        ->get('/member/network?root_id=' . $child->id)
        ->assertInertia(fn ($page) => $page
            ->where('tree.id', $child->id)
            ->where('tree.name', $child->user->name)
        );
});

it('builds correct ancestors breadcrumb when drilled in', function () {
    $child = MemberProfile::factory()->create([
        'parent_id' => $this->profile->id,
    ]);
    $this->profile->update(['left_child_id' => $child->id]);

    actingAs($this->user)
        ->get('/member/network?root_id=' . $child->id)
        ->assertInertia(fn ($page) => $page
            ->has('ancestors', 1)
            ->where('ancestors.0.id', $this->profile->id)
            ->where('ancestors.0.name', $this->user->name)
        );
});

it('ignores root_id that does not belong to the users downline', function () {
    $otherUser    = User::factory()->create();
    $otherProfile = MemberProfile::factory()->for($otherUser)->create();

    actingAs($this->user)
        ->get('/member/network?root_id=' . $otherProfile->id)
        ->assertInertia(fn ($page) => $page
            ->where('tree.id', $this->profile->id)
        );
});

it('includes left and right children in the tree', function () {
    $leftChild  = MemberProfile::factory()->create(['parent_id' => $this->profile->id]);
    $rightChild = MemberProfile::factory()->create(['parent_id' => $this->profile->id]);

    $this->profile->update([
        'left_child_id'  => $leftChild->id,
        'right_child_id' => $rightChild->id,
    ]);

    actingAs($this->user)
        ->get('/member/network')
        ->assertInertia(fn ($page) => $page
            ->where('tree.left.id', $leftChild->id)
            ->where('tree.right.id', $rightChild->id)
        );
});

it('returns null for empty child slots', function () {
    actingAs($this->user)
        ->get('/member/network')
        ->assertInertia(fn ($page) => $page
            ->where('tree.left', null)
            ->where('tree.right', null)
        );
});
