<?php

return [
    'api_key' => env('BITESHIP_API_KEY'),
    'base_url' => 'https://api.biteship.com',
    'origin_postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE', '40131'),
    'default_weight' => (int) env('BITESHIP_DEFAULT_WEIGHT', 1000),
];
