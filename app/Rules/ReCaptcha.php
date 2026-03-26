<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReCaptcha implements ValidationRule
{
    /**
     * Minimum score threshold for reCAPTCHA v3 (0.0 - 1.0).
     */
    protected float $minScore;

    public function __construct(float $minScore = 0.5)
    {
        $this->minScore = $minScore;
    }

    /**
     * Cache verified tokens to avoid double verification in the same request.
     *
     * @var array<string, bool>
     */
    protected static $verifiedTokens = [];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $settings = \App\Models\SiteSetting::instance();

        // Skip if recaptcha is not configured
        if (! $settings->nocaptcha_sitekey || ! $settings->nocaptcha_secret) {
            return;
        }

        if (empty($value)) {
            Log::info('reCAPTCHA v3: Token is empty');
            $fail('Verifikasi reCAPTCHA gagal. Silakan muat ulang halaman dan coba lagi.');

            return;
        }

        // Check cache
        if (isset(static::$verifiedTokens[$value])) {
            if (! static::$verifiedTokens[$value]) {
                $fail('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            }

            return;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $settings->nocaptcha_secret,
            'response' => $value,
            'remoteip' => request()->ip(),
        ]);

        $json = $response->json();
        $success = $response->successful() && ($json['success'] ?? false);
        $score = $json['score'] ?? 0;

        Log::info('reCAPTCHA v3: Verification result', [
            'success' => $success,
            'score' => $score,
            'action' => $json['action'] ?? null,
        ]);

        $passed = $success && $score >= $this->minScore;
        static::$verifiedTokens[$value] = $passed;

        if (! $passed) {
            Log::warning('reCAPTCHA v3: Verification failed', [
                'score' => $score,
                'min_score' => $this->minScore,
                'error_codes' => $json['error-codes'] ?? [],
            ]);

            $fail('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
        }
    }
}
