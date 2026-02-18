# GrowRich

Platform MLM (Multi-Level Marketing) berbasis web yang dibangun dengan Laravel 12, Inertia.js, dan React.

## Tech Stack

- **Backend:** Laravel 12 + PHP 8.3
- **Frontend:** React 19 + Inertia.js v2 + Tailwind CSS v4
- **Database:** MySQL
- **Testing:** Pest 4

## Fitur Utama

- **Jaringan Biner** — Penempatan member menggunakan algoritma BFS (Binary Tree, spillover otomatis)
- **Sistem Bonus:**
  - Sponsor Bonus (langsung saat registrasi, Pending → admin approve)
  - Pairing Bonus (dihitung tiap tengah malam via Artisan command)
  - Matching, Leveling, Repeat Order, Global Sharing Bonus
- **Pairing Point Ledger** — Rekam jejak poin setiap transaksi
- **Wallet** — Ewallet (20%) & Cash (80%) split otomatis
- **Email Notifikasi** — Welcome member baru, notif sponsor, notif bonus tersedia
- **Admin Panel** — Approval bonus, manajemen member & PIN
- **Repeat Order** — Sistem pembelian ulang produk

## Paket & Bonus

| Paket    | Harga Registrasi | Sponsor Bonus | Max Pairing/Hari |
|----------|-----------------|---------------|------------------|
| Silver   | Rp 2.450.000    | Rp 500.000    | 10 pasang        |
| Gold     | Rp 4.900.000    | Rp 1.000.000  | 20 pasang        |
| Platinum | Rp 7.350.000    | Rp 1.500.000  | 30 pasang        |

Pairing Bonus: **Rp 15.000 / pasang PP**

## Instalasi

```bash
# Clone & install dependencies
git clone https://github.com/muhammad-febriansyah/growrich.git
cd growrich
composer install
npm install

# Konfigurasi environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate --seed

# Jalankan aplikasi
composer run dev
```

## Perintah Artisan

```bash
# Jalankan pairing bonus harian (otomatis via scheduler tiap 00:05)
php artisan bonus:run-daily

# Jalankan untuk tanggal tertentu
php artisan bonus:run-daily 2026-01-15
```

## Scheduler

Tambahkan cron berikut di server:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

## Testing

```bash
php artisan test --compact
```

## Lisensi

Hak cipta © 2026 GrowRich. Seluruh hak dilindungi.
