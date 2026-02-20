<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LegalPageController extends Controller
{
    /**
     * Show the form for editing the specified legal page.
     */
    public function edit(string $slug)
    {
        $page = LegalPage::where('slug', $slug)->firstOrFail();

        $page->image_url = $page->image ? Storage::url($page->image) : null;

        return Inertia::render('admin/legal-pages/edit', [
            'page' => $page,
        ]);
    }

    /**
     * Update the specified legal page in storage.
     */
    public function update(Request $request, string $slug)
    {
        $page = LegalPage::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        Log::info('Request image check', [
            'has_file' => $request->hasFile('image'),
            'request_image' => $request->image,
            'validated_initially' => array_keys($validated),
        ]);

        if ($request->hasFile('image')) {
            if ($page->image) {
                Storage::disk('public')->delete($page->image);
            }
            $validated['image'] = $request->file('image')->store('legal-pages', 'public');
        } else {
            unset($validated['image']);
        }

        Log::info('Final validated data', ['keys' => array_keys($validated)]);

        $page->update($validated);

        return back()->with('success', "Halaman {$page->title} berhasil diperbarui.");
    }
}
