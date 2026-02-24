<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareerLevelController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/career-levels/index', [
            'levels' => CareerLevel::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:career_levels,key',
            'label' => 'required|string|max:255',
            'required_pp' => 'required|integer|min:0',
            'global_share_percent' => 'required|numeric|min:0|max:100',
            'sort_order' => 'nullable|integer',
            'dot_color' => 'nullable|string|max:255',
            'text_color' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        CareerLevel::create($validated);

        return back()->with('success', 'Jenjang karir berhasil ditambahkan.');
    }

    public function update(Request $request, CareerLevel $careerLevel)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:career_levels,key,' . $careerLevel->id,
            'label' => 'required|string|max:255',
            'required_pp' => 'required|integer|min:0',
            'global_share_percent' => 'required|numeric|min:0|max:100',
            'sort_order' => 'nullable|integer',
            'dot_color' => 'nullable|string|max:255',
            'text_color' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $careerLevel->update($validated);

        return back()->with('success', 'Jenjang karir berhasil diperbarui.');
    }

    public function destroy(CareerLevel $careerLevel)
    {
        $careerLevel->delete();

        return back()->with('success', 'Jenjang karir berhasil dihapus.');
    }
}
