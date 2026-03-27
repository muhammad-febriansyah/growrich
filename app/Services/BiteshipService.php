<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipService
{
    private string $apiKey;

    private string $baseUrl;

    public function __construct()
    {
        $settings = \App\Models\SiteSetting::instance();
        $this->apiKey = $settings->biteship_api_key ?? config('biteship.api_key');
        $this->baseUrl = config('biteship.base_url');
    }

    /**
     * Search areas by postal code or city name.
     *
     * @return array<int, array{id: string, name: string, country_id: string, country_name: string, administrative_division_level_1_name: string, administrative_division_level_2_name: string, administrative_division_level_3_name: string, postal_code: int}>
     */
    public function searchAreas(string $input): array
    {
        $cacheKey = 'biteship_areas_'.md5($input);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($input) {
            $response = $this->get('/v1/maps/areas', [
                'countries' => 'ID',
                'input' => $input,
                'type' => 'single',
            ]);

            if (! $response->successful()) {
                Log::error('Biteship searchAreas failed', [
                    'input' => $input,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            }

            return $response->json('areas', []);
        });
    }

    /**
     * Get the origin area ID based on configured postal code.
     */
    public function getOriginAreaId(): ?string
    {
        $settings = \App\Models\SiteSetting::instance();
        $postalCode = $settings->biteship_origin_postal_code ?? config('biteship.origin_postal_code');
        $cacheKey = 'biteship_origin_area_'.md5($postalCode ?? '');

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($postalCode) {
            $areas = $this->searchAreas($postalCode);

            return ! empty($areas) ? $areas[0]['id'] : null;
        });
    }

    /**
     * Get shipping rates for given destination area and items.
     *
     * @return array{success: bool, rates: array<int, array{courier_code: string, courier_name: string, courier_service_code: string, courier_service_name: string, type: string, description: string, duration: string, shipment_duration_range: string, price: int}>}
     */
    public function getRates(string $destinationAreaId, int $weightGrams, int $quantity = 1): array
    {
        $originAreaId = $this->getOriginAreaId();

        if (! $originAreaId) {
            return ['success' => false, 'rates' => [], 'message' => 'Origin area tidak ditemukan.'];
        }

        $response = $this->post('/v1/rates/couriers', [
            'origin_area_id' => $originAreaId,
            'destination_area_id' => $destinationAreaId,
            'couriers' => 'jne,jnt,sicepat,anteraja,lion,ninja,id_express,pos',
            'items' => [
                [
                    'name' => 'Paket GrowRich',
                    'value' => 50000,
                    'length' => 30,
                    'width' => 20,
                    'height' => 10,
                    'weight' => $weightGrams * $quantity,
                    'quantity' => $quantity,
                ],
            ],
        ]);

        if (! $response->successful()) {
            Log::error('Biteship getRates failed', [
                'destination_area_id' => $destinationAreaId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return ['success' => false, 'rates' => [], 'message' => 'Gagal mendapatkan tarif pengiriman.'];
        }

        $data = $response->json();

        return [
            'success' => true,
            'rates' => $data['pricing'] ?? [],
        ];
    }

    private function get(string $path, array $query = []): Response
    {
        return Http::withToken($this->apiKey)
            ->acceptJson()
            ->get($this->baseUrl.$path, $query);
    }

    private function post(string $path, array $data = []): Response
    {
        return Http::withToken($this->apiKey)
            ->acceptJson()
            ->post($this->baseUrl.$path, $data);
    }
}
