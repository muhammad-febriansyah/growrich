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

    private bool $dummyMode;

    public function __construct()
    {
        $settings = \App\Models\SiteSetting::instance();
        $this->apiKey = $settings->biteship_api_key ?? config('biteship.api_key');
        $this->baseUrl = config('biteship.base_url');
        $this->dummyMode = (bool) config('biteship.dummy_mode');
    }

    /**
     * Search areas by postal code or city name.
     *
     * @return array<int, array{id: string, name: string, country_id: string, country_name: string, administrative_division_level_1_name: string, administrative_division_level_2_name: string, administrative_division_level_3_name: string, postal_code: int}>
     */
    /**
     * @return array<int, array{id: string, name: string, administrative_division_level_1_name: string, administrative_division_level_2_name: string, administrative_division_level_3_name: string, postal_code: int}>
     */
    private function dummyAreas(string $input): array
    {
        return [
            ['id' => 'IDNP6IDNC217IDND1340IDZ40111', 'name' => 'Bandung Kulon', 'country_id' => 'ID', 'country_name' => 'Indonesia', 'administrative_division_level_1_name' => 'Jawa Barat', 'administrative_division_level_2_name' => 'Kota Bandung', 'administrative_division_level_3_name' => 'Bandung Kulon', 'postal_code' => 40213],
            ['id' => 'IDNP6IDNC217IDND1341IDZ40112', 'name' => 'Astanaanyar', 'country_id' => 'ID', 'country_name' => 'Indonesia', 'administrative_division_level_1_name' => 'Jawa Barat', 'administrative_division_level_2_name' => 'Kota Bandung', 'administrative_division_level_3_name' => 'Astanaanyar', 'postal_code' => 40241],
            ['id' => 'IDNP6IDNC217IDND1342IDZ40113', 'name' => 'Regol', 'country_id' => 'ID', 'country_name' => 'Indonesia', 'administrative_division_level_1_name' => 'Jawa Barat', 'administrative_division_level_2_name' => 'Kota Bandung', 'administrative_division_level_3_name' => 'Regol', 'postal_code' => 40251],
            ['id' => 'IDNP6IDNC217IDND1343IDZ40114', 'name' => 'Cicendo', 'country_id' => 'ID', 'country_name' => 'Indonesia', 'administrative_division_level_1_name' => 'Jawa Barat', 'administrative_division_level_2_name' => 'Kota Bandung', 'administrative_division_level_3_name' => 'Cicendo', 'postal_code' => 40172],
            ['id' => 'IDNP6IDNC217IDND1344IDZ40115', 'name' => 'Sukasari', 'country_id' => 'ID', 'country_name' => 'Indonesia', 'administrative_division_level_1_name' => 'Jawa Barat', 'administrative_division_level_2_name' => 'Kota Bandung', 'administrative_division_level_3_name' => 'Sukasari', 'postal_code' => 40152],
        ];
    }

    /**
     * @return array{success: bool, rates: array<int, mixed>}
     */
    private function dummyRates(): array
    {
        return [
            'success' => true,
            'rates' => [
                ['courier_code' => 'jne', 'courier_name' => 'JNE', 'courier_service_code' => 'REG', 'courier_service_name' => 'Reguler', 'type' => 'reguler', 'description' => 'Layanan reguler JNE', 'duration' => '2-3 hari', 'shipment_duration_range' => '2 - 3', 'price' => 15000],
                ['courier_code' => 'jnt', 'courier_name' => 'J&T Express', 'courier_service_code' => 'EZ', 'courier_service_name' => 'J&T EZ', 'type' => 'reguler', 'description' => 'Layanan reguler J&T', 'duration' => '2-3 hari', 'shipment_duration_range' => '2 - 3', 'price' => 13000],
                ['courier_code' => 'sicepat', 'courier_name' => 'SiCepat', 'courier_service_code' => 'BEST', 'courier_service_name' => 'BEST', 'type' => 'reguler', 'description' => 'Layanan reguler SiCepat', 'duration' => '1-2 hari', 'shipment_duration_range' => '1 - 2', 'price' => 16000],
                ['courier_code' => 'anteraja', 'courier_name' => 'Anteraja', 'courier_service_code' => 'REG', 'courier_service_name' => 'Reguler', 'type' => 'reguler', 'description' => 'Layanan reguler Anteraja', 'duration' => '2-3 hari', 'shipment_duration_range' => '2 - 3', 'price' => 12000],
                ['courier_code' => 'pos', 'courier_name' => 'POS Indonesia', 'courier_service_code' => 'Pos Kilat Khusus', 'courier_service_name' => 'Kilat Khusus', 'type' => 'reguler', 'description' => 'Layanan POS Kilat Khusus', 'duration' => '3-5 hari', 'shipment_duration_range' => '3 - 5', 'price' => 10000],
            ],
        ];
    }

    public function searchAreas(string $input): array
    {
        if ($this->dummyMode) {
            return $this->dummyAreas($input);
        }

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
        if ($this->dummyMode) {
            return $this->dummyRates();
        }

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
