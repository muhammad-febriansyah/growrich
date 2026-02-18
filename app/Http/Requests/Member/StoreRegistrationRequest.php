<?php

namespace App\Http\Requests\Member;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pin_code' => [
                'required',
                Rule::exists('registration_pins', 'pin_code')
                    ->where('status', 'available')
                    ->where('assigned_to', auth()->id()),
            ],
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'leg_position' => 'required|in:left,right',
        ];
    }

    /**
     * Get custom validation messages in Indonesian.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin_code.required' => 'Kode PIN wajib diisi.',
            'pin_code.exists'   => 'Kode PIN tidak valid atau sudah pernah digunakan.',

            'name.required' => 'Nama lengkap wajib diisi.',
            'name.string'   => 'Nama lengkap harus berupa teks.',
            'name.max'      => 'Nama lengkap tidak boleh lebih dari 255 karakter.',

            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
            'email.max'      => 'Email tidak boleh lebih dari 255 karakter.',
            'email.unique'   => 'Email sudah terdaftar, gunakan email lain.',

            'password.required'  => 'Password wajib diisi.',
            'password.min'       => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',

            'leg_position.required' => 'Posisi kaki wajib dipilih.',
            'leg_position.in'       => 'Posisi kaki harus kiri atau kanan.',
        ];
    }
}
