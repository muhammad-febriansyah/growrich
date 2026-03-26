<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user()->load('memberProfile', 'wallet');
        $profile = $user->memberProfile;

        $sponsor = null;
        if ($user->sponsor_id) {
            $sponsorUser = \App\Models\User::select('id', 'name', 'member_id', 'referral_code', 'phone')
                ->find($user->sponsor_id);
            if ($sponsorUser) {
                $sponsor = [
                    'name' => $sponsorUser->name,
                    'member_id' => $sponsorUser->member_id ?? $sponsorUser->referral_code,
                    'phone' => $sponsorUser->phone,
                ];
            }
        }

        $upline = null;
        if ($profile && $profile->parent_id) {
            $parentProfile = MemberProfile::with('user:id,name,member_id,referral_code,phone')
                ->find($profile->parent_id);
            if ($parentProfile && $parentProfile->user) {
                $upline = [
                    'name' => $parentProfile->user->name,
                    'member_id' => $parentProfile->user->member_id ?? $parentProfile->user->referral_code,
                    'phone' => $parentProfile->user->phone,
                ];
            }
        }

        return Inertia::render('member/profile/index', [
            'user' => $user,
            'sponsor' => $sponsor,
            'upline' => $upline,
        ]);
    }

    public function edit(): Response
    {
        $user = auth()->user();

        return Inertia::render('member/profile/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ];

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $oldPath = ltrim(str_replace('/storage/', '', $user->avatar), '/');
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $updateData['avatar'] = '/storage/'.$path;
        }

        $user->update($updateData);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function changePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = auth()->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini tidak sesuai.']);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}
