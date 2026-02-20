<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $packages = Package::ordered()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('key', 'like', "%{$search}%");
            })
            ->withCount(['memberProfiles', 'registrationPins'])
            ->get();

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/packages/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Package::create($validated);

        return redirect()->route('admin.packages.index')
            ->with('success', "Paket \"{$validated['name']}\" berhasil ditambahkan.");
    }

    public function edit(Package $package): Response
    {
        return Inertia::render('admin/packages/edit', [
            'package' => $package,
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate($this->rules($package));

        $package->update($validated);
        $package->clearCache();

        return redirect()->route('admin.packages.index')
            ->with('success', "Paket \"{$package->name}\" berhasil diperbarui.");
    }

    public function destroy(Package $package): RedirectResponse
    {
        $membersCount = $package->memberProfiles()->count();
        $pinsCount = $package->registrationPins()->count();

        if ($membersCount > 0 || $pinsCount > 0) {
            return back()->with('error', "Paket \"{$package->name}\" tidak dapat dihapus karena masih digunakan oleh {$membersCount} member atau {$pinsCount} PIN.");
        }

        $package->clearCache();
        $package->delete();

        return redirect()->route('admin.packages.index')
            ->with('success', "Paket \"{$package->name}\" berhasil dihapus.");
    }

    /**
     * Shared validation rules for store/update.
     */
    private function rules(?Package $package = null): array
    {
        $packageId = $package?->id;

        return [
            'key' => ['required', 'string', 'max:50', Rule::unique('packages', 'key')->ignore($packageId)],
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:1', Rule::unique('packages', 'sort_order')->ignore($packageId)],
            'pairing_point' => ['required', 'integer', 'min:0'],
            'reward_point' => ['required', 'integer', 'min:0'],
            'max_pairing_per_day' => ['required', 'integer', 'min:1'],
            'registration_price' => ['required', 'integer', 'min:0'],
            'upgrade_price' => ['nullable', 'integer', 'min:0'],
            'sponsor_bonus_unit' => ['required', 'integer', 'min:0'],
            'leveling_bonus_amount' => ['required', 'integer', 'min:0'],
        ];
    }
}
