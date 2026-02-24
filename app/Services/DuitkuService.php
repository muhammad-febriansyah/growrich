<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    private string $merchantCode;

    private string $apiKey;

    private string $baseUrl;

    private bool $isSandbox;

    public function __construct()
    {
        $settings = \App\Models\SiteSetting::instance();
        $this->merchantCode = $settings->duitku_merchant_code ?? '';
        $this->apiKey = $settings->duitku_api_key ?? '';
        $this->isSandbox = (bool) ($settings->duitku_is_sandbox ?? true);
        $this->baseUrl = $this->isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry'
            : 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';
    }

    /**
     * Create a Duitku transaction and return payment URL + reference.
     *
     * @return array{paymentUrl: string, reference: string, merchantOrderId: string}
     *
     * @throws \RuntimeException
     */
    public function createTransaction(
        string $merchantOrderId,
        int $amount,
        string $productDetails,
        string $customerName,
        string $email,
        string $returnUrl,
        string $callbackUrl
    ): array {
        $signature = md5($this->merchantCode.$merchantOrderId.$amount.$this->apiKey);

        $payload = [
            'merchantCode' => $this->merchantCode,
            'paymentAmount' => $amount,
            'paymentMethod' => '',  // kosong = tampilkan semua metode pembayaran
            'merchantOrderId' => $merchantOrderId,
            'productDetails' => $productDetails,
            'customerVaName' => $customerName,
            'email' => $email,
            'returnUrl' => $returnUrl,
            'callbackUrl' => $callbackUrl,
            'signature' => $signature,
            'expiryPeriod' => 1440, // 24 jam
        ];

        $response = Http::timeout(30)
            ->post($this->baseUrl, $payload);

        $data = $response->json();

        if (! isset($data['paymentUrl'])) {
            Log::error('[Duitku] Request failed', ['status' => $response->status(), 'data' => $data]);
            throw new \RuntimeException($data['Message'] ?? 'Respon Duitku tidak valid.');
        }

        return [
            'paymentUrl' => $data['paymentUrl'],
            'reference' => $data['reference'] ?? '',
            'merchantOrderId' => $merchantOrderId,
        ];
    }

    /**
     * Verify Duitku callback signature.
     */
    public function verifyCallback(array $data): bool
    {
        $expectedSignature = md5(
            $this->merchantCode.
            ($data['amount'] ?? '').
            ($data['merchantOrderId'] ?? '').
            $this->apiKey
        );

        return hash_equals($expectedSignature, $data['signature'] ?? '');
    }
}
