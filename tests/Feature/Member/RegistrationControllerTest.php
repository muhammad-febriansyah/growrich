<?php

use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Models\MemberProfile;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePin(PackageType $package = PackageType::Silver, ?int $assignedTo = null): RegistrationPin
{
    return RegistrationPin::factory()->forPackage($package)->create(['assigned_to' => $assignedTo]);
}

function registerPayload(RegistrationPin $pin, string $leg = 'left'): array
{
    return [
        'pin_code'              => $pin->pin_code,
        'name'                  => 'New Member',
        'email'                 => 'new@member.test',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'leg_position'          => $leg,
    ];
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    Mail::fake();

    $this->sponsor = User::factory()->create();
    $this->profile = MemberProfile::factory()->for($this->sponsor)->create();
    Wallet::factory()->for($this->sponsor)->create();
});

// ── Basic registration ────────────────────────────────────────────────────────

it('registers a new member directly under sponsor when chosen leg is empty', function () {
    $pin = makePin(assignedTo: $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload($pin, 'left'))
        ->assertRedirect('/member/network');

    $newUser = User::where('email', 'new@member.test')->first();

    expect($newUser)->not->toBeNull()
        ->and($newUser->sponsor_id)->toBe($this->sponsor->id);

    $newProfile = $newUser->memberProfile;

    expect($newProfile->parent_id)->toBe($this->profile->id)
        ->and($newProfile->leg_position->value)->toBe('left')
        ->and($newProfile->career_level->value)->toBe(CareerLevel::Member->value)
        ->and($newProfile->package_type->value)->toBe($pin->package_type->value);

    $this->profile->refresh();
    expect($this->profile->left_child_id)->toBe($newProfile->id);
});

it('creates a wallet with zero balance for the new member', function () {
    actingAs($this->sponsor)
        ->post('/member/register', registerPayload(makePin(assignedTo: $this->sponsor->id)));

    $newUser = User::where('email', 'new@member.test')->first();
    expect($newUser->wallet->balance)->toBe(0);
});

it('marks the pin as used after registration', function () {
    $pin = makePin(assignedTo: $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload($pin));

    $pin->refresh();
    $newUser = User::where('email', 'new@member.test')->first();

    expect($pin->status)->toBe('used')
        ->and($pin->used_by)->toBe($newUser->id);
});

// ── BFS placement ─────────────────────────────────────────────────────────────

it('places new member at shallowest slot when sponsors chosen leg is occupied', function () {
    $leftChild = MemberProfile::factory()->create(['parent_id' => $this->profile->id, 'leg_position' => 'left']);
    $this->profile->update(['left_child_id' => $leftChild->id]);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload(makePin(assignedTo: $this->sponsor->id), 'left'));

    $newProfile = User::where('email', 'new@member.test')->first()->memberProfile;

    expect($newProfile->parent_id)->toBe($leftChild->id)
        ->and($newProfile->leg_position->value)->toBe('left');
});

it('bfs picks shallowest slot across branches, not straight down', function () {
    /*
     *   Sponsor
     *   └── LC (both slots full)
     *       ├── LL (left full, right EMPTY) ← BFS should land here
     *       └── LR (both full)
     *
     * A "go straight left" approach would go deeper past LL.
     * Correct BFS must return LL.right (level 2, not level 3+).
     */
    $lc  = MemberProfile::factory()->create(['parent_id' => $this->profile->id, 'leg_position' => 'left']);
    $ll  = MemberProfile::factory()->create(['parent_id' => $lc->id, 'leg_position' => 'left']);
    $llLeft = MemberProfile::factory()->create(['parent_id' => $ll->id, 'leg_position' => 'left']);
    $lr  = MemberProfile::factory()->create(['parent_id' => $lc->id, 'leg_position' => 'right']);
    $lrl = MemberProfile::factory()->create(['parent_id' => $lr->id, 'leg_position' => 'left']);
    $lrr = MemberProfile::factory()->create(['parent_id' => $lr->id, 'leg_position' => 'right']);

    $this->profile->update(['left_child_id' => $lc->id]);
    $lc->update(['left_child_id' => $ll->id, 'right_child_id' => $lr->id]);
    $ll->update(['left_child_id' => $llLeft->id]); // right slot of LL is empty
    $lr->update(['left_child_id' => $lrl->id, 'right_child_id' => $lrr->id]);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload(makePin(assignedTo: $this->sponsor->id), 'left'));

    $newProfile = User::where('email', 'new@member.test')->first()->memberProfile;

    // Should land at LL.right (shallowest), not deeper
    expect($newProfile->parent_id)->toBe($ll->id)
        ->and($newProfile->leg_position->value)->toBe('right');
});

// ── Validation ────────────────────────────────────────────────────────────────

it('rejects a used pin', function () {
    $pin = RegistrationPin::factory()->used($this->sponsor->id)->create(['assigned_to' => $this->sponsor->id]);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload($pin))
        ->assertSessionHasErrors('pin_code');
});

it('rejects a duplicate email', function () {
    User::factory()->create(['email' => 'new@member.test']);

    actingAs($this->sponsor)
        ->post('/member/register', registerPayload(makePin(assignedTo: $this->sponsor->id)))
        ->assertSessionHasErrors('email');
});

it('redirects unauthenticated users', function () {
    $this->post('/member/register', registerPayload(makePin()))
        ->assertRedirect('/login');
});
