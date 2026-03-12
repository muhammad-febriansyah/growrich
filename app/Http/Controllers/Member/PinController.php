<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\TransferPinRequest;
use App\Models\PinTransferLog;
use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PinController extends Controller
{
    public function index(Request $request): Response
    {
        $pins = RegistrationPin::where('assigned_to', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('member/pins/index', [
            'pins' => $pins,
        ]);
    }

    public function transfer(TransferPinRequest $request): RedirectResponse
    {
        $pin = RegistrationPin::where('id', $request->pin_id)
            ->where('status', 'available')
            ->where('assigned_to', auth()->id())
            ->firstOrFail();

        $recipient = User::where('member_id', $request->recipient_member_id)->firstOrFail();

        if ($recipient->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat mentransfer PIN ke diri sendiri.');
        }

        $fromUserId = $pin->assigned_to;
        $pin->update(['assigned_to' => $recipient->id]);

        PinTransferLog::create([
            'pin_id' => $pin->id,
            'from_user_id' => $fromUserId,
            'to_user_id' => $recipient->id,
            'transferred_by' => auth()->id(),
            'actor_type' => 'member',
        ]);

        return back()->with('success', "PIN {$pin->pin_code} berhasil ditransfer ke {$recipient->name} ({$recipient->member_id}).");
    }

    public function lookupMember(Request $request): JsonResponse
    {
        $request->validate(['member_id' => 'required|string']);

        $user = User::where('member_id', $request->member_id)
            ->select('id', 'name', 'member_id')
            ->first();

        if (! $user) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found' => true,
            'name' => $user->name,
            'member_id' => $user->member_id,
        ]);
    }
}
