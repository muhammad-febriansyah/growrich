<?php

namespace Tests\Feature\Member;

use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PinControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_view_assigned_pins()
    {
        $member = User::factory()->create(['role' => 'member']);
        $otherMember = User::factory()->create(['role' => 'member']);

        $assignedPin = RegistrationPin::factory()->create([
            'assigned_to' => $member->id,
            'status' => 'available',
        ]);

        $unassignedPin = RegistrationPin::factory()->create([
            'assigned_to' => null,
            'status' => 'available',
        ]);

        $otherMemberPin = RegistrationPin::factory()->create([
            'assigned_to' => $otherMember->id,
            'status' => 'available',
        ]);

        $response = $this->actingAs($member)
            ->get(route('member.pins.index'));

        $response->assertStatus(200);
        $response->assertSee($assignedPin->pin_code);
        $response->assertDontSee($unassignedPin->pin_code);
        $response->assertDontSee($otherMemberPin->pin_code);
    }

    public function test_unauthenticated_user_cannot_access_member_pins()
    {
        $response = $this->get(route('member.pins.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_cannot_access_member_pins()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $response = $this->actingAs($admin)
            ->get(route('member.pins.index'));
        $response->assertRedirect(route('admin.dashboard'));
    }
}
