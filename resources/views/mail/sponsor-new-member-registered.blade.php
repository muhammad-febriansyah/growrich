<x-mail::message>
# Member Baru Bergabung di Jaringan Anda

Halo {{ $sponsor->name }},

Kabar baik! Member baru telah berhasil bergabung di jaringan Anda.

| Info | Detail |
|------|--------|
| Nama Member | {{ $newMember->name }} |
| Paket | {{ $packageType }} |

Sponsor Bonus Anda sedang diproses dan akan segera tersedia untuk persetujuan admin.

<x-mail::button :url="route('member.network.index')">
Lihat Dashboard
</x-mail::button>

Salam,<br>
{{ config('app.name') }}
</x-mail::message>
