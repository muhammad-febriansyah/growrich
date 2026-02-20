<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResellerProgramSetting extends Model
{
    protected $fillable = [
        'cara_bergabung',
        'compensation_title',
        'compensation_description',
        'compensation_columns',
        'trip_title',
        'trip_description',
        'trip_images',
    ];

    protected $casts = [
        'cara_bergabung' => 'array',
        'compensation_columns' => 'array',
        'trip_images' => 'array',
    ];

    /**
     * Get the singleton instance, creating a default row if none exists.
     */
    public static function instance(): static
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'compensation_title' => 'Compensation Plan',
                'compensation_description' => 'Compensation Plan kami disiapkan untuk Anda yang menjadi reseller. Bagi Anda yang masih menjadi Special Customer silahkan upgrade terlebih dulu ke Paket Bisnis Reseller untuk bisa mendapatkan bonus dan reward.',
                'trip_title' => 'Trip Program',
                'trip_description' => 'Ingin mengunjungi destinasi-destinasi wisata favorit yang cantik dan eksotik di seluruh dunia? Mari keliling dunia bersama kami! Kami telah merancang program yang bisa mengantarkan Anda ke destinasi-destinasi wisata impian di seluruh dunia.',
                'trip_images' => [],
            ]
        );
    }
}
