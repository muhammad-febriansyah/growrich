<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Log;

class ReCaptcha implements ValidationRule
{
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
            Log::info('reCAPTCHA: Value is empty');
            $fail('Silakan centang verifikasi reCAPTCHA.');

            return;
        }

        // Check cache
        if (isset(static::$verifiedTokens[$value])) {
            Log::info('reCAPTCHA: Using cached result', ['success' => static::$verifiedTokens[$value]]);
            if (! static::$verifiedTokens[$value]) {
                $fail('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            }

            return;
        }

        Log::info('reCAPTCHA: Verifying token', [
            'token' => substr($value, 0, 10).'...',
            'ip' => request()->ip(),
        ]);

        $response = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $settings->nocaptcha_secret,
            'response' => $value,
            'remoteip' => request()->ip(),
        ]);

        $success = $response->successful() && $response->json('success');
        static::$verifiedTokens[$value] = $success;

        if (! $success) {
            Log::warning('reCAPTCHA verification failed', [
                'error_codes' => $response->json('error-codes'),
                'http_status' => $response->status(),
                'response' => $response->json(),
            ]);

            $fail('Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
        } else {
            Log::info('reCAPTCHA: Verification successful');
        }
    }
}
