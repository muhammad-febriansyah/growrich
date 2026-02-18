<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Product $p) => $this->withImageUrl($p));

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|max:100|unique:products,sku',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:2048',
            'regular_price' => 'required|integer|min:0',
            'ro_price' => 'required|integer|min:0',
            'member_discount' => 'required|integer|min:0|max:100',
            'is_active' => 'required|boolean',
            'stock' => 'required|integer|min:0',
            'bpom_number' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function show(Product $product): Response
    {
        return Inertia::render('admin/products/show', [
            'product' => $this->withImageUrl($product),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $this->withImageUrl($product),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|max:100|unique:products,sku,'.$product->id,
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:2048',
            'regular_price' => 'required|integer|min:0',
            'ro_price' => 'required|integer|min:0',
            'member_discount' => 'required|integer|min:0|max:100',
            'is_active' => 'required|boolean',
            'stock' => 'required|integer|min:0',
            'bpom_number' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('admin.products.show', $product)->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil dihapus.');
    }

    private function withImageUrl(Product $product): array
    {
        $arr = $product->toArray();
        $arr['image_url'] = $product->image ? Storage::url($product->image) : null;

        return $arr;
    }
}
