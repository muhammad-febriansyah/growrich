<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BankController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/banks/index', [
            'banks' => Bank::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('banks', 'public');
        }

        Bank::create($validated);

        return back()->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    public function update(Request $request, Bank $bank)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($request->hasFile('image')) {
            if ($bank->image) {
                Storage::disk('public')->delete($bank->image);
            }
            $validated['image'] = $request->file('image')->store('banks', 'public');
        }

        $bank->update($validated);

        return back()->with('success', 'Rekening bank berhasil diperbarui.');
    }

    public function destroy(Bank $bank)
    {
        if ($bank->image) {
            Storage::disk('public')->delete($bank->image);
        }
        $bank->delete();

        return back()->with('success', 'Rekening bank berhasil dihapus.');
    }
}
