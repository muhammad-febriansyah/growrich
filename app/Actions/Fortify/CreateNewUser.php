<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Mlm\UserRole;
use App\Jobs\SendWelcomeRegistrationEmail;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'sponsor_code' => ['nullable', 'string', 'exists:users,referral_code'],
            'g-recaptcha-response' => [new \App\Rules\ReCaptcha],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.string' => 'Nama tidak valid.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar, silakan gunakan email lain.',
            'phone.string' => 'Nomor HP tidak valid.',
            'phone.max' => 'Nomor HP maksimal 20 karakter.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'sponsor_code.exists' => 'Kode sponsor tidak ditemukan. Pastikan kode yang Anda masukkan sudah benar.',
            'g-recaptcha-response.required' => 'Silakan centang verifikasi reCAPTCHA terlebih dahulu.',
        ])->validate();

        $sponsorId = null;

        if (! empty($input['sponsor_code'])) {
            $sponsorId = User::where('referral_code', $input['sponsor_code'])->value('id');
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'] ?? null,
            'password' => $input['password'],
            'sponsor_id' => $sponsorId,
            'role' => UserRole::Member,
        ]);

        SendWelcomeRegistrationEmail::dispatch($user);

        return $user;
    }
}
