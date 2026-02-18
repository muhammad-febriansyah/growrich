<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\RegistrationPin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PinController extends Controller
{
    public function index(Request $request)
    {
        $pins = RegistrationPin::where('assigned_to', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('member/pins/index', [
            'pins' => $pins,
        ]);
    }
}
