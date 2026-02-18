<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegistrationPin;
use App\Enums\Mlm\PackageType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PinController extends Controller
{
    public function index(Request $request)
    {
        $query = RegistrationPin::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('package')) {
            $query->where('package_type', $request->package);
        }

        if ($request->filled('search')) {
            $query->where('pin_code', 'like', "%{$request->search}%");
        }

        $pins = $query->with('purchasedBy', 'assignedTo', 'usedBy')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $members = User::where('role', 'member')->select('id', 'name', 'email')->get();

        return Inertia::render('admin/pins/index', [
            'pins' => $pins,
            'members' => $members,
            'filters' => $request->only(['status', 'package', 'search']),
        ]);
    }

    public function assign(Request $request, RegistrationPin $pin)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::find($request->user_id);
        if (! $user->isMember()) {
            return back()->with('error', 'Hanya member yang dapat menerima PIN.');
        }

        if ($pin->status !== 'available') {
            return back()->with('error', 'PIN tidak tersedia untuk ditugaskan.');
        }

        $pin->update([
            'assigned_to' => $user->id,
        ]);

        return back()->with('success', "PIN berhasil ditugaskan ke {$user->name}.");
    }

    public function store(Request $request)
    {
        $request->validate([
            'package_type' => 'required',
            'amount' => 'required|integer|min:1|max:100',
        ]);

        $package = PackageType::from($request->package_type);
        $price = $package->registrationPrice();

        for ($i = 0; $i < $request->amount; $i++) {
            RegistrationPin::create([
                'pin_code' => 'PIN-' . Str::upper(Str::random(8)),
                'package_type' => $package,
                'price' => $price,
                'status' => 'available',
                'purchased_by' => auth()->id(),
            ]);
        }

        return back()->with('success', "{$request->amount} PIN berhasil digenerate.");
    }

    public function expire(RegistrationPin $pin)
    {
        if ($pin->status === 'available') {
            $pin->update(['status' => 'expired']);
            return back()->with('success', 'PIN berhasil dinonaktifkan.');
        }

        return back()->with('error', 'PIN tidak dapat dinonaktifkan.');
    }
}
