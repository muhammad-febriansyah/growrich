<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuestRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pin_code' => [
                'required',
                Rule::exists('registration_pins', 'pin_code')
                    ->where('status', 'available')
                    ->whereNotNull('assigned_to'),
            ],
            // Placement (opsional — dari link sponsor)
            'parent_id' => 'nullable|integer|exists:member_profiles,id',
            // Data Akun
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username|alpha_num',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'leg_position' => 'required|in:left,right',
            // Data Pribadi
            'birth_date' => 'required|date',
            'birth_place' => 'required|string|max:100',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'marital_status' => 'required|in:Belum Menikah,Menikah,Cerai Hidup,Cerai Mati',
            'nationality' => 'required|string|max:100',
            'id_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'village' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            // Rekening Bank
            'bank_name' => 'required|string|max:100',
            'bank_branch' => 'nullable|string|max:100',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:255',
            // Data Ahli Waris
            'beneficiary_name' => 'required|string|max:255',
            'beneficiary_relationship' => 'required|string|max:100',
            'beneficiary_id_number' => 'nullable|string|max:20',
            'beneficiary_phone' => 'nullable|string|max:20',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin_code.required' => 'Kode PIN wajib diisi.',
            'pin_code.exists' => 'Kode PIN tidak valid, sudah digunakan, atau tidak terdaftar dalam sistem.',
            'parent_id.exists' => 'Slot penempatan tidak ditemukan.',

            'name.required' => 'Nama lengkap wajib diisi.',
            'username.unique' => 'Username sudah digunakan, pilih yang lain.',
            'username.alpha_num' => 'Username hanya boleh berisi huruf dan angka.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar, gunakan email lain.',
            'phone.required' => 'No. HP/Telepon wajib diisi.',

            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',

            'leg_position.required' => 'Posisi kaki wajib dipilih.',

            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'gender.required' => 'Jenis kelamin wajib dipilih.',
            'gender.in' => 'Jenis kelamin tidak valid.',
            'marital_status.required' => 'Status pernikahan wajib dipilih.',
            'marital_status.in' => 'Status pernikahan tidak valid.',
            'nationality.required' => 'Kewarganegaraan wajib diisi.',
            'id_number.required' => 'Nomor KTP wajib diisi.',
            'address.required' => 'Alamat lengkap wajib diisi.',
            'province.required' => 'Provinsi wajib diisi.',
            'city.required' => 'Kota/Kabupaten wajib diisi.',
            'district.required' => 'Kecamatan wajib diisi.',
            'village.required' => 'Kelurahan/Desa wajib diisi.',
            'postal_code.required' => 'Kode Pos wajib diisi.',

            'bank_name.required' => 'Nama bank wajib diisi.',
            'bank_account_number.required' => 'Nomor rekening wajib diisi.',
            'bank_account_name.required' => 'Nama pemilik rekening wajib diisi.',

            'beneficiary_name.required' => 'Nama ahli waris wajib diisi.',
            'beneficiary_relationship.required' => 'Hubungan ahli waris wajib diisi.',
        ];
    }
}
