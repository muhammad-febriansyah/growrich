<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketingBonus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingBonusController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/marketing-bonuses/index', [
            'bonuses' => MarketingBonus::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:daily,monthly',
            'icon' => 'required|string',
            'icon_color' => 'nullable|string',
            'tag' => 'nullable|string',
            'tag_color' => 'nullable|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'details' => 'nullable|array',
            'details.*.label' => 'required|string',
            'details.*.value' => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        MarketingBonus::create($validated);

        return back()->with('success', 'Bonus marketing berhasil ditambahkan.');
    }

    public function update(Request $request, MarketingBonus $marketingBonus)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:daily,monthly',
            'icon' => 'required|string',
            'icon_color' => 'nullable|string',
            'tag' => 'nullable|string',
            'tag_color' => 'nullable|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'details' => 'nullable|array',
            'details.*.label' => 'required|string',
            'details.*.value' => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $marketingBonus->update($validated);

        return back()->with('success', 'Bonus marketing berhasil diperbarui.');
    }

    public function destroy(MarketingBonus $marketingBonus)
    {
        $marketingBonus->delete();

        return back()->with('success', 'Bonus marketing berhasil dihapus.');
    }
}
