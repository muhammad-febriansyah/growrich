<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LegalPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\LegalPage::updateOrCreate(
            ['slug' => 'terms-conditions'],
            [
                'title' => 'Syarat & Ketentuan',
                'content' => '<h2>1. Penerimaan Ketentuan</h2><p>Dengan mengakses platform GrowRich, Anda setuju untuk terikat dengan syarat dan ketentuan ini...</p><h2>2. Keanggotaan</h2><p>Pendaftaran akun memerlukan informasi yang akurat...</p>',
            ]
        );

        \App\Models\LegalPage::updateOrCreate(
            ['slug' => 'privacy-policy'],
            [
                'title' => 'Kebijakan Privasi',
                'content' => '<h2>1. Informasi yang Kami Kumpulkan</h2><p>Kami mengumpulkan informasi pribadi yang Anda berikan saat pendaftaran...</p><h2>2. Penggunaan Informasi</h2><p>Informasi Anda digunakan untuk memproses transaksi dan memberikan dukungan teknis...</p>',
            ]
        );

        \App\Models\LegalPage::updateOrCreate(
            ['slug' => 'about-us'],
            [
                'title' => 'Tentang Kami',
                'content' => '<p>GrowRich adalah platform finansial modern yang berfokus pada pemberdayaan ekonomi masyarakat melalui sistem yang inovatif dan terpercaya.</p>',
                'vision' => '<p>Menjadi platform finansial terpercaya yang memberdayakan setiap individu untuk mencapai kebebasan finansial...</p>',
                'mission' => '<p>Menyediakan sistem yang transparan, aman, dan inovatif untuk pertumbuhan aset masyarakat.</p>',
            ]
        );
    }
}
