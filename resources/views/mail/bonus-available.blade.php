<x-mail::message>
# Bonus Baru Tersedia

Halo {{ $user->name }},

Anda memiliki bonus baru yang menunggu persetujuan admin.

| Info | Detail |
|------|--------|
| Tipe Bonus | {{ $bonus->bonus_type->label() }} |
| Nominal | Rp {{ number_format($bonus->amount, 0, ',', '.') }} |
| Status | {{ $bonus->status->label() }} |
| Tanggal | {{ $bonus->bonus_date->format('d M Y') }} |

<x-mail::button :url="route('member.bonuses.index')">
Lihat Riwayat Bonus
</x-mail::button>

Salam,<br>
{{ config('app.name') }}
</x-mail::message>
