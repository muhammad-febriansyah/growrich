<?php

use App\Enums\Mlm\PackageType;
use App\Models\PinOrder;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Services\DuitkuService;
use Database\Seeders\SiteSettingSeeder;

beforeEach(function () {
    $this->seed([SiteSettingSeeder::class]);

    $duitku = Mockery::mock(DuitkuService::class);
    $duitku->shouldReceive('verifyCallback')->andReturn(true);
    $this->app->instance(DuitkuService::class, $duitku);
});

function makePinOrder(array $attributes = []): PinOrder
{
    $user = User::factory()->create();

    return PinOrder::create(array_merge([
        'order_number' => 'PO-'.strtoupper(str_pad((string) random_int(1, 999999), 8, '0', STR_PAD_LEFT)),
        'user_id' => $user->id,
        'package_type' => PackageType::Gold,
        'upgrade_from' => null,
        'quantity' => 1,
        'unit_price' => 500000,
        'total_amount' => 500000,
        'status' => 'pending',
        'payment_method' => 'duitku',
        'phone' => '08123456789',
        'shipping_name' => 'Test User',
        'shipping_address' => 'Jl. Test No. 1',
        'shipping_province' => 'Jawa Barat',
        'shipping_city' => 'Bandung',
        'shipping_district' => 'Coblong',
        'shipping_village' => 'Dago',
        'shipping_postal_code' => '40135',
    ], $attributes));
}

it('duitku_callback_generates_regular_pin_without_upgrade_from', function () {
    $order = makePinOrder(['package_type' => PackageType::Silver]);

    $this->postJson(route('payment.callback.pin-order'), [
        'merchantOrderId' => $order->order_number,
        'resultCode' => '00',
        'amount' => $order->total_amount,
        'reference' => 'REF123',
        'signature' => 'mocked',
    ]);

    expect(RegistrationPin::where('purchased_by', $order->user_id)->count())->toBe(1);

    $pin = RegistrationPin::where('purchased_by', $order->user_id)->first();
    expect($pin->upgrade_from)->toBeNull();
    expect($pin->pin_code)->toStartWith('PIN-');
    expect($pin->package_type->value)->toBe('Silver');
    expect($pin->status)->toBe('available');
});

it('duitku_callback_generates_upgrade_pin_with_upgrade_from', function () {
    $order = makePinOrder([
        'package_type' => PackageType::Gold,
        'upgrade_from' => 'Silver',
    ]);

    $this->postJson(route('payment.callback.pin-order'), [
        'merchantOrderId' => $order->order_number,
        'resultCode' => '00',
        'amount' => $order->total_amount,
        'reference' => 'REF456',
        'signature' => 'mocked',
    ]);

    expect(RegistrationPin::where('purchased_by', $order->user_id)->count())->toBe(1);

    $pin = RegistrationPin::where('purchased_by', $order->user_id)->first();
    expect($pin->upgrade_from)->toBe('Silver');
    expect($pin->pin_code)->toStartWith('UPIN-');
    expect($pin->package_type->value)->toBe('Gold');
    expect($pin->status)->toBe('available');
});

it('duitku_callback_generates_correct_quantity_of_upgrade_pins', function () {
    $order = makePinOrder([
        'package_type' => PackageType::Gold,
        'upgrade_from' => 'Silver',
        'quantity' => 3,
        'total_amount' => 1500000,
    ]);

    $this->postJson(route('payment.callback.pin-order'), [
        'merchantOrderId' => $order->order_number,
        'resultCode' => '00',
        'amount' => $order->total_amount,
        'reference' => 'REF789',
        'signature' => 'mocked',
    ]);

    expect(RegistrationPin::where('purchased_by', $order->user_id)->count())->toBe(3);
    expect(RegistrationPin::where('purchased_by', $order->user_id)->whereNotNull('upgrade_from')->count())->toBe(3);
});

it('duitku_callback_does_not_generate_pins_on_failed_payment', function () {
    $order = makePinOrder(['package_type' => PackageType::Gold, 'upgrade_from' => 'Silver']);

    $this->postJson(route('payment.callback.pin-order'), [
        'merchantOrderId' => $order->order_number,
        'resultCode' => '01',
        'amount' => $order->total_amount,
        'signature' => 'mocked',
    ]);

    expect(RegistrationPin::where('purchased_by', $order->user_id)->count())->toBe(0);
    expect($order->fresh()->status)->toBe('pending');
});
