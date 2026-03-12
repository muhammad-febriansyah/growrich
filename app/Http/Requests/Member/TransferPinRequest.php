<?php

namespace App\Http\Requests\Member;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pin_id' => [
                'required',
                'integer',
                Rule::exists('registration_pins', 'id')
                    ->where('status', 'available')
                    ->where('assigned_to', auth()->id()),
            ],
            'recipient_member_id' => [
                'required',
                'string',
                Rule::exists('users', 'member_id'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin_id.required' => 'PIN wajib dipilih.',
            'pin_id.exists' => 'PIN tidak valid atau tidak tersedia untuk ditransfer.',
            'recipient_member_id.required' => 'ID Member penerima wajib diisi.',
            'recipient_member_id.exists' => 'ID Member tidak ditemukan. Pastikan ID Member sudah benar.',
        ];
    }
}
