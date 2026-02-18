<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Enums\Mlm\UserRole;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', UserRole::Member);

        if ($request->filled('package')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('package_type', $request->package);
            });
        }

        if ($request->filled('career_level')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('career_level', $request->career_level);
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('package_status', $request->status);
            });
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $members = $query->with('memberProfile')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/members/index', [
            'members' => $members,
            'filters' => $request->only(['package', 'career_level', 'status', 'search']),
        ]);
    }

    public function show(User $user)
    {
        $user->load('memberProfile', 'wallet');

        return Inertia::render('admin/members/show', [
            'member' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('memberProfile');
        return Inertia::render('admin/members/edit', [
            'member' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required',
            'role' => 'required',
            'package_type' => 'required',
            'career_level' => 'required',
        ]);

        $user->update([
            'status' => $request->status,
            'role' => $request->role,
        ]);

        $user->memberProfile->update([
            'package_type' => $request->package_type,
            'career_level' => $request->career_level,
        ]);

        return redirect()->route('admin.members.show', $user->id)->with('success', 'Data member berhasil diperbarui.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('password123'),
        ]);

        return back()->with('success', 'Password member berhasil direset ke "password123".');
    }
}
