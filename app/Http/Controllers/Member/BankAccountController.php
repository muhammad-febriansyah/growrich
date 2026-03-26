<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:255',
            'is_primary' => 'boolean',
        ], [
            'bank_name.required' => 'Nama bank wajib diisi.',
            'account_number.required' => 'Nomor rekening wajib diisi.',
            'account_name.required' => 'Nama pemilik rekening wajib diisi.',
        ]);

        $user = auth()->user();

        if ($validated['is_primary'] ?? false) {
            BankAccount::where('user_id', $user->id)->update(['is_primary' => false]);
        }

        $isPrimary = $validated['is_primary'] ?? BankAccount::where('user_id', $user->id)->doesntExist();

        BankAccount::create(array_merge($validated, [
            'user_id' => $user->id,
            'is_primary' => $isPrimary,
        ]));

        return back()->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    public function setPrimary(BankAccount $bankAccount): RedirectResponse
    {
        if ($bankAccount->user_id !== auth()->id()) {
            abort(403);
        }

        BankAccount::where('user_id', auth()->id())->update(['is_primary' => false]);
        $bankAccount->update(['is_primary' => true]);

        return back()->with('success', 'Rekening utama berhasil diubah.');
    }

    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        if ($bankAccount->user_id !== auth()->id()) {
            abort(403);
        }

        $bankAccount->delete();

        if ($bankAccount->is_primary) {
            BankAccount::where('user_id', auth()->id())->latest()->first()?->update(['is_primary' => true]);
        }

        return back()->with('success', 'Rekening bank berhasil dihapus.');
    }
}
