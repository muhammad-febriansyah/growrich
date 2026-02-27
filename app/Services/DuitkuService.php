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
        string $callbackUrl,
        string $paymentMethod = 'VA'
    ): array {
        $signature = md5($this->merchantCode.$merchantOrderId.$amount.$this->apiKey);

        $payload = [
            'merchantCode' => $this->merchantCode,
            'paymentAmount' => $amount,
            'paymentMethod' => $paymentMethod,
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
     * Get available payment methods from Duitku.
     *
     * @return array<int, array{paymentMethod: string, paymentName: string, paymentImage: string, totalFee: string}>
     */
    public function getPaymentMethods(int $amount): array
    {
        $datetime = now()->timezone('Asia/Jakarta')->format('Y-m-d H:i:s');
        $signature = hash('sha256', $this->merchantCode.$amount.$datetime.$this->apiKey);

        $baseUrl = $this->isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
            : 'https://passport.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod';

        $response = Http::timeout(15)->post($baseUrl, [
            'merchantcode' => $this->merchantCode,
            'amount' => $amount,
            'datetime' => $datetime,
            'signature' => $signature,
        ]);

        return $response->json('paymentFee') ?? [];
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
