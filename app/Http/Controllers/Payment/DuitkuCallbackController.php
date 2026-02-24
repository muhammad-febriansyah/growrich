<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\PinOrder;
use App\Models\RegistrationPin;
use App\Models\RepeatOrder;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DuitkuCallbackController extends Controller
{
    public function __construct(private DuitkuService $duitku) {}

    /**
     * Unified callback handler — routes by merchantOrderId prefix:
     *   PO-* → PIN Order (auto-generate PINs)
     *   RO-* → Repeat Order (mark as paid)
     */
    public function handle(Request $request): Response
    {
        $merchantOrderId = $request->input('merchantOrderId', '');

        if (str_starts_with($merchantOrderId, 'PO-')) {
            return $this->pinOrder($request);
        }

        if (str_starts_with($merchantOrderId, 'RO-')) {
            return $this->repeatOrder($request);
        }

        Log::warning('[Duitku] Unknown merchantOrderId prefix', ['merchantOrderId' => $merchantOrderId]);

        return response('OK');
    }

    /**
     * Handle Duitku callback for PIN orders.
     * Auto-generates PINs on successful payment (resultCode = "00").
     */
    public function pinOrder(Request $request): Response
    {
        $data = $request->all();
        Log::info('[Duitku PIN] Callback received', $data);

        if (! $this->duitku->verifyCallback($data)) {
            Log::warning('[Duitku PIN] Invalid signature', $data);

            return response('Bad Signature', 400);
        }

        $merchantOrderId = $data['merchantOrderId'] ?? null;
        $resultCode = $data['resultCode'] ?? null;

        $pinOrder = PinOrder::where('order_number', $merchantOrderId)->first();

        if (! $pinOrder) {
            Log::error('[Duitku PIN] Order not found', ['merchantOrderId' => $merchantOrderId]);

            return response('OK'); // Return 200 to Duitku so it doesn't retry
        }

        if ($pinOrder->status === 'completed') {
            return response('OK'); // Already processed
        }

        if ($resultCode === '00') {
            DB::transaction(function () use ($pinOrder, $data) {
                $pinOrder->update([
                    'paid_at' => now(),
                    'duitku_reference' => $data['reference'] ?? null,
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                $package = $pinOrder->package_type instanceof \App\Enums\Mlm\PackageType
                    ? $pinOrder->package_type
                    : \App\Enums\Mlm\PackageType::from($pinOrder->package_type);

                for ($i = 0; $i < $pinOrder->quantity; $i++) {
                    RegistrationPin::create([
                        'pin_code' => 'PIN-'.Str::upper(Str::random(8)),
                        'package_type' => $package,
                        'price' => $pinOrder->unit_price,
                        'status' => 'available',
                        'purchased_by' => $pinOrder->user_id,
                        'assigned_to' => $pinOrder->user_id,
                    ]);
                }
            });

            Log::info('[Duitku PIN] Success – PINs generated', ['order' => $pinOrder->order_number]);
        } else {
            Log::info('[Duitku PIN] Non-success resultCode', ['resultCode' => $resultCode]);
        }

        return response('OK');
    }

    /**
     * Handle Duitku callback for Repeat Orders.
     * On success, marks order as paid (admin still approves).
     */
    public function repeatOrder(Request $request): Response
    {
        $data = $request->all();
        Log::info('[Duitku RO] Callback received', $data);

        if (! $this->duitku->verifyCallback($data)) {
            Log::warning('[Duitku RO] Invalid signature', $data);

            return response('Bad Signature', 400);
        }

        $merchantOrderId = $data['merchantOrderId'] ?? null;
        $resultCode = $data['resultCode'] ?? null;

        $order = RepeatOrder::where('order_number', $merchantOrderId)->first();

        if (! $order) {
            Log::error('[Duitku RO] Order not found', ['merchantOrderId' => $merchantOrderId]);

            return response('OK');
        }

        if (in_array($order->status, ['completed', 'rejected'])) {
            return response('OK');
        }

        if ($resultCode === '00') {
            $order->update([
                'paid_at' => now(),
                'duitku_reference' => $data['reference'] ?? null,
                'status' => 'paid',
            ]);

            Log::info('[Duitku RO] Marked as paid', ['order' => $order->order_number]);
        } else {
            // Restore stock for failed/cancelled payment
            $order->load('items.product');

            foreach ($order->items as $item) {
                if ($item->product && $item->product->stock !== null) {
                    $item->product->increment('stock', $item->quantity);
                }
            }

            $order->update(['status' => 'rejected']);

            Log::info('[Duitku RO] Payment failed – stock restored', ['order' => $order->order_number, 'resultCode' => $resultCode]);
        }

        return response('OK');
    }
}
