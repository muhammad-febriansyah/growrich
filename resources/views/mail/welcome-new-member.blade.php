<x-mail::message>
# Selamat Datang di GrowRich, {{ $user->name }}!

Akun Anda telah berhasil dibuat. Berikut detail keanggotaan Anda:

| Info | Detail |
|------|--------|
| Nama | {{ $user->name }} |
| Email | {{ $user->email }} |
| Paket | {{ $profile->package_type->value }} |
| Bergabung | {{ $profile->activated_at->format('d M Y') }} |

<x-mail::button :url="route('member.network.index')">
Masuk ke Dashboard
</x-mail::button>

Selamat bergabung dan semoga sukses bersama GrowRich!

Salam,<br>
{{ config('app.name') }}
</x-mail::message>
