<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResellerProgramSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResellerProgramController extends Controller
{
    /**
     * Display the reseller program management page.
     */
    public function index()
    {
        $settings = ResellerProgramSetting::instance();

        $data = $settings->toArray();
        if (isset($data['cara_bergabung']) && is_array($data['cara_bergabung'])) {
            $data['cara_bergabung'] = collect($data['cara_bergabung'])->map(function ($item) {
                if (isset($item['image']) && $item['image']) {
                    $item['image_url'] = Storage::url($item['image']);
                } else {
                    $item['image_url'] = null;
                }

                return $item;
            })->toArray();
        }

        if (isset($data['trip_images']) && is_array($data['trip_images'])) {
            $data['trip_images_urls'] = collect($data['trip_images'])->map(function ($path) {
                return Storage::url($path);
            })->toArray();
        }

        return Inertia::render('admin/reseller-program/edit', [
            'settings' => $data,
        ]);
    }

    /**
     * Update the reseller program settings.
     */
    public function update(Request $request)
    {
        $settings = ResellerProgramSetting::instance();

        $validated = $request->validate([
            'cara_bergabung' => 'nullable|array',
            'cara_bergabung.*.title' => 'required|string|max:255',
            'cara_bergabung.*.desc' => 'required|string',
            'cara_bergabung.*.image' => 'nullable',
            'compensation_title' => 'required|string|max:255',
            'compensation_description' => 'required|string',
            'compensation_columns' => 'nullable|array',
            'compensation_columns.*.title' => 'required|string|max:255',
            'compensation_columns.*.description' => 'required|string',
            'compensation_columns.*.items' => 'nullable|array',
            'compensation_columns.*.items.*.title' => 'required|string|max:255',
            'compensation_columns.*.items.*.description' => 'required|string',
            'trip_title' => 'required|string|max:255',
            'trip_description' => 'required|string',
            'trip_images' => 'nullable|array',
            'new_trip_images' => 'nullable|array',
            'new_trip_images.*' => 'nullable|image|max:2048',
        ]);

        $caraBergabung = $request->input('cara_bergabung', []);
        $existingCaraBergabung = $settings->cara_bergabung ?? [];

        foreach ($caraBergabung as $index => &$item) {
            if ($request->hasFile("cara_bergabung.{$index}.image")) {
                // Delete old image if exists
                if (isset($existingCaraBergabung[$index]['image'])) {
                    Storage::disk('public')->delete($existingCaraBergabung[$index]['image']);
                }
                $path = $request->file("cara_bergabung.{$index}.image")->store('reseller-program', 'public');
                $item['image'] = $path;
            } else {
                // Keep existing image path if no new file is uploaded
                $item['image'] = $existingCaraBergabung[$index]['image'] ?? null;
            }
        }

        $settings->update([
            'cara_bergabung' => $caraBergabung,
            'compensation_title' => $validated['compensation_title'],
            'compensation_description' => $validated['compensation_description'],
            'compensation_columns' => $validated['compensation_columns'],
            'trip_title' => $validated['trip_title'],
            'trip_description' => $validated['trip_description'],
        ]);

        // Handle Trip Images
        $currentTripImages = $request->input('trip_images', []);
        $existingTripImages = $settings->trip_images ?? [];

        // Delete removed images
        foreach ($existingTripImages as $path) {
            if (! in_array($path, $currentTripImages)) {
                Storage::disk('public')->delete($path);
            }
        }

        // Handle new images
        $newPaths = [];
        if ($request->hasFile('new_trip_images')) {
            foreach ($request->file('new_trip_images') as $file) {
                $newPaths[] = $file->store('reseller-program/trip', 'public');
            }
        }

        $settings->update([
            'trip_images' => array_merge($currentTripImages, $newPaths),
        ]);

        return back()->with('success', 'Halaman Reseller Program berhasil diperbarui.');
    }
}
