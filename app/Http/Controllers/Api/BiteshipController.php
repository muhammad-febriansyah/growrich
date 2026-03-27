<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BiteshipController extends Controller
{
    public function __construct(private readonly BiteshipService $biteship) {}

    public function areas(Request $request): JsonResponse
    {
        $request->validate([
            'input' => ['required', 'string', 'min:3'],
        ]);

        $areas = $this->biteship->searchAreas($request->input('input'));

        return response()->json(['areas' => $areas]);
    }

    public function rates(Request $request): JsonResponse
    {
        $request->validate([
            'destination_area_id' => ['required', 'string'],
            'weight' => ['nullable', 'integer', 'min:1'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $weight = $request->integer('weight', config('biteship.default_weight'));
        $quantity = $request->integer('quantity', 1);

        $result = $this->biteship->getRates(
            $request->string('destination_area_id'),
            $weight,
            $quantity
        );

        if (! $result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json(['rates' => $result['rates']]);
    }
}
