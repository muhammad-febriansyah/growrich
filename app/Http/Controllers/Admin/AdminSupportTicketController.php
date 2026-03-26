<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SupportTicket::with('user')->withCount('replies')->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', "%{$request->search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->search}%"));
            });
        }

        $tickets = $query->paginate(20)->withQueryString();

        $stats = [
            'open' => SupportTicket::where('status', 'open')->count(),
            'replied' => SupportTicket::where('status', 'replied')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
        ];

        return Inertia::render('admin/support/index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['user', 'replies.user']);

        return Inertia::render('admin/support/show', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ], [
            'message.required' => 'Pesan balasan wajib diisi.',
        ]);

        SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_admin' => true,
        ]);

        $ticket->update(['status' => 'replied']);

        return back()->with('success', 'Balasan berhasil dikirim.');
    }

    public function close(SupportTicket $ticket): RedirectResponse
    {
        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return back()->with('success', 'Tiket berhasil ditutup.');
    }
}
