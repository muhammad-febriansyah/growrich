<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('admin_can_access_reports_page', function () {
    actingAs($this->admin)
        ->get('/admin/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->has('selectedYear')
            ->has('yearOptions')
            ->has('revenueByMonth', 12)
            ->has('memberGrowthByMonth', 12)
            ->has('bonusByMonth', 12)
            ->has('bonusByType')
            ->has('withdrawalByMonth', 12)
            ->has('networkByPackage')
            ->has('networkByStatus')
            ->has('summary')
        );
});

it('guest_cannot_access_reports_page', function () {
    $this->get('/admin/reports')->assertRedirect();
});

it('member_cannot_access_reports_page', function () {
    $member = User::factory()->create(['role' => 'member']);

    actingAs($member)
        ->get('/admin/reports')
        ->assertRedirect();
});

it('report_accepts_year_filter', function () {
    actingAs($this->admin)
        ->get('/admin/reports?year=2025')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports/index')
            ->where('selectedYear', 2025)
        );
});

it('summary_contains_correct_keys', function () {
    actingAs($this->admin)
        ->get('/admin/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('summary.total_revenue')
            ->has('summary.total_bonus_paid')
            ->has('summary.total_new_members')
            ->has('summary.total_withdrawn')
        );
});
