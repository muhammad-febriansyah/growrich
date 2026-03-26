<?php

use App\Models\NewsCategory;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

// ── Index ─────────────────────────────────────────────────────────────────────

it('admin_can_list_news_categories', function () {
    NewsCategory::factory(3)->create();

    actingAs($this->admin)
        ->get('/admin/news-categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/news-categories/index')->has('categories'));
});

it('guest_cannot_access_news_categories_index', function () {
    $this->get('/admin/news-categories')->assertRedirect();
});

// ── Create / Store ────────────────────────────────────────────────────────────

it('admin_can_create_a_news_category', function () {
    actingAs($this->admin)
        ->post('/admin/news-categories', ['title' => 'Teknologi', 'slug' => ''])
        ->assertRedirect('/admin/news-categories');

    expect(NewsCategory::where('title', 'Teknologi')->exists())->toBeTrue();
});

it('store_auto_generates_slug_when_empty', function () {
    actingAs($this->admin)
        ->post('/admin/news-categories', ['title' => 'Kesehatan', 'slug' => '']);

    expect(NewsCategory::where('slug', 'kesehatan')->exists())->toBeTrue();
});

it('store_validates_required_title', function () {
    actingAs($this->admin)
        ->post('/admin/news-categories', ['title' => ''])
        ->assertSessionHasErrors(['title']);
});

it('store_rejects_duplicate_slug', function () {
    NewsCategory::factory()->create(['slug' => 'existing-slug']);

    actingAs($this->admin)
        ->post('/admin/news-categories', ['title' => 'Other', 'slug' => 'existing-slug'])
        ->assertSessionHasErrors(['slug']);
});

// ── Edit / Update ─────────────────────────────────────────────────────────────

it('admin_can_view_edit_form_for_news_category', function () {
    $category = NewsCategory::factory()->create();

    actingAs($this->admin)
        ->get("/admin/news-categories/{$category->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/news-categories/edit')->has('category'));
});

it('admin_can_update_a_news_category', function () {
    $category = NewsCategory::factory()->create(['title' => 'Old Title']);

    actingAs($this->admin)
        ->put("/admin/news-categories/{$category->id}", ['title' => 'New Title', 'slug' => ''])
        ->assertRedirect('/admin/news-categories');

    expect($category->fresh()->title)->toBe('New Title');
});

// ── Destroy ───────────────────────────────────────────────────────────────────

it('admin_can_delete_a_news_category', function () {
    $category = NewsCategory::factory()->create();

    actingAs($this->admin)
        ->delete("/admin/news-categories/{$category->id}")
        ->assertRedirect('/admin/news-categories');

    expect(NewsCategory::find($category->id))->toBeNull();
});
