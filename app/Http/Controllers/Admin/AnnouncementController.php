<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::latest()->paginate(15);

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/announcements/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,promo,warning,system',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ], [
            'title.required' => 'Judul wajib diisi.',
            'content.required' => 'Konten wajib diisi.',
            'type.required' => 'Tipe wajib dipilih.',
            'expires_at.after' => 'Tanggal kedaluwarsa harus di masa depan.',
        ]);

        $validated['published_at'] = ($validated['is_active'] ?? false) ? now() : null;

        Announcement::create($validated);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil dibuat.');
    }

    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('admin/announcements/edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,promo,warning,system',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ], [
            'title.required' => 'Judul wajib diisi.',
            'content.required' => 'Konten wajib diisi.',
        ]);

        if (($validated['is_active'] ?? false) && ! $announcement->is_active) {
            $validated['published_at'] = now();
        } elseif (! ($validated['is_active'] ?? false)) {
            $validated['published_at'] = null;
        }

        $announcement->update($validated);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil diperbarui.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Pengumuman berhasil dihapus.');
    }
}
