<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeatureController extends Controller
{
    public function index(Request $request)
    {
        $features = Feature::query()
            ->when($request->search, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/features/index', [
            'features' => $features,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/features/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'icon' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'required|boolean',
            'sort_order' => 'required|integer',
        ]);

        Feature::create($request->all());

        return redirect()->route('admin.features.index')->with('success', 'Fitur berhasil ditambahkan.');
    }

    public function edit(Feature $feature)
    {
        return Inertia::render('admin/features/edit', [
            'feature' => $feature,
        ]);
    }

    public function update(Request $request, Feature $feature)
    {
        $request->validate([
            'icon' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'required|boolean',
            'sort_order' => 'required|integer',
        ]);

        $feature->update($request->all());

        return redirect()->route('admin.features.index')->with('success', 'Fitur berhasil diperbarui.');
    }

    public function destroy(Feature $feature)
    {
        $feature->delete();

        return back()->with('success', 'Fitur berhasil dihapus.');
    }
}
