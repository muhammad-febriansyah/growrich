<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(): Response
    {
        $tickets = SupportTicket::where('user_id', auth()->id())
            ->withCount('replies')
            ->latest()
            ->paginate(15);

        return Inertia::render('member/support/index', [
            'tickets' => $tickets,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('member/support/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'priority' => 'in:low,normal,high',
        ], [
            'subject.required' => 'Subjek tiket wajib diisi.',
            'message.required' => 'Pesan wajib diisi.',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => auth()->id(),
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'priority' => $validated['priority'] ?? 'normal',
            'status' => 'open',
        ]);

        return redirect()->route('member.support.show', $ticket->id)
            ->with('success', 'Tiket berhasil dibuat. Tim kami akan segera merespons.');
    }

    public function show(SupportTicket $ticket): Response
    {
        if ($ticket->user_id !== auth()->id()) {
            abort(403);
        }

        $ticket->load(['replies.user']);

        return Inertia::render('member/support/show', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        if ($ticket->user_id !== auth()->id()) {
            abort(403);
        }

        if ($ticket->status === 'closed') {
            return back()->with('error', 'Tiket ini sudah ditutup dan tidak dapat dibalas.');
        }

        $request->validate([
            'message' => 'required|string|max:5000',
        ], [
            'message.required' => 'Pesan balasan wajib diisi.',
        ]);

        SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_admin' => false,
        ]);

        $ticket->update(['status' => 'open']);

        return back()->with('success', 'Balasan berhasil dikirim.');
    }
}
