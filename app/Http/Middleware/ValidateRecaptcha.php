<?php

namespace App\Http\Middleware;

use App\Rules\ReCaptcha;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ValidateRecaptcha
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Validator::make($request->all(), [
            'g-recaptcha-response' => [new ReCaptcha],
        ], [
            'g-recaptcha-response.*' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
        ])->validate();

        return $next($request);
    }
}
