<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Enums\Mlm\UserRole;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', UserRole::Admin);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => UserRole::Admin,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Administrator baru berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        if ($user->role !== UserRole::Admin) {
            abort(403, 'Akses ditolak. User bukan administrator.');
        }

        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        if ($user->role !== UserRole::Admin) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($request->only(['name', 'email', 'phone']));

        return redirect()->route('admin.users.index')->with('success', 'Data administrator berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->role !== UserRole::Admin) {
            abort(403);
        }

        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Administrator berhasil dihapus.');
    }

    public function resetPassword(Request $request, User $user)
    {
        if ($user->role !== UserRole::Admin) {
            abort(403);
        }

        $user->update([
            'password' => Hash::make('password123'),
        ]);

        return back()->with('success', 'Password administrator berhasil direset ke "password123".');
    }
}
