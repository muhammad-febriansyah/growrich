<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RoPreference;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoPreferenceController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $profile = $user->memberProfile;

        $products = Product::active()->orderBy('name')->get(['id', 'name', 'sku', 'ro_price', 'unit', 'image', 'stock']);

        $preferences = $profile
            ? RoPreference::where('member_profile_id', $profile->id)
                ->with('product:id,name,sku,ro_price,unit,image,stock')
                ->get()
                ->map(fn ($pref) => [
                    'id' => $pref->id,
                    'product_id' => $pref->product_id,
                    'quantity' => $pref->quantity,
                    'product' => $pref->product,
                ])
            : collect();

        return Inertia::render('member/order/ro-preference', [
            'products' => $products,
            'preferences' => $preferences,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
        ], [
            'items.required' => 'Pilih minimal satu produk.',
            'items.*.product_id.exists' => 'Produk tidak ditemukan.',
            'items.*.quantity.min' => 'Jumlah minimal 1.',
            'items.*.quantity.max' => 'Jumlah maksimal 99.',
        ]);

        /** @var User $user */
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        // Replace all preferences for this member
        RoPreference::where('member_profile_id', $profile->id)->delete();

        foreach ($request->items as $item) {
            RoPreference::create([
                'member_profile_id' => $profile->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return back()->with('success', 'Template auto RO berhasil disimpan.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();
        $profile = $user->memberProfile;

        if ($profile) {
            RoPreference::where('member_profile_id', $profile->id)->delete();
        }

        return back()->with('success', 'Template auto RO berhasil dihapus.');
    }
}
