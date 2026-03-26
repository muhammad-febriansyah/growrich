<?php

use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = NewsCategory::factory()->create();
});

// ── Index ─────────────────────────────────────────────────────────────────────

it('admin_can_list_news', function () {
    News::factory(3)->create();

    actingAs($this->admin)
        ->get('/admin/news')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/news/index')->has('news'));
});

it('guest_cannot_access_news_index', function () {
    $this->get('/admin/news')->assertRedirect();
});

// ── Create / Store ────────────────────────────────────────────────────────────

it('admin_can_view_create_news_form', function () {
    actingAs($this->admin)
        ->get('/admin/news/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/news/create')->has('categories'));
});

it('admin_can_create_news', function () {
    actingAs($this->admin)
        ->post('/admin/news', [
            'title' => 'Berita Terbaru',
            'content' => 'Isi berita lengkap di sini.',
            'news_category_id' => $this->category->id,
            'is_published' => false,
        ])
        ->assertRedirect('/admin/news');

    expect(News::where('title', 'Berita Terbaru')->exists())->toBeTrue();
});

it('store_validates_required_fields', function () {
    actingAs($this->admin)
        ->post('/admin/news', [])
        ->assertSessionHasErrors(['title', 'content']);
});

it('store_sets_published_at_when_published', function () {
    actingAs($this->admin)
        ->post('/admin/news', [
            'title' => 'Published News',
            'content' => 'Content here.',
            'is_published' => true,
        ]);

    $news = News::where('title', 'Published News')->first();
    expect($news->published_at)->not->toBeNull();
});

// ── Edit / Update ─────────────────────────────────────────────────────────────

it('admin_can_view_edit_form_for_news', function () {
    $news = News::factory()->create();

    actingAs($this->admin)
        ->get("/admin/news/{$news->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/news/edit')->has('news')->has('categories'));
});

it('admin_can_update_news', function () {
    $news = News::factory()->create(['title' => 'Old Title']);

    actingAs($this->admin)
        ->put("/admin/news/{$news->id}", [
            'title' => 'Updated Title',
            'content' => 'Updated content.',
            'is_published' => false,
        ])
        ->assertRedirect('/admin/news');

    expect($news->fresh()->title)->toBe('Updated Title');
});

// ── Destroy ───────────────────────────────────────────────────────────────────

it('admin_can_delete_news', function () {
    $news = News::factory()->create();

    actingAs($this->admin)
        ->delete("/admin/news/{$news->id}")
        ->assertRedirect('/admin/news');

    expect(News::find($news->id))->toBeNull();
});
