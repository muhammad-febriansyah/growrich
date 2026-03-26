<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChatController extends Controller
{
    public function index(): Response
    {
        $sessions = ChatSession::withCount('messages')
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('last_activity_at')
            ->paginate(30);

        $stats = [
            'active' => ChatSession::whereIn('status', ['bot', 'human'])->count(),
            'bot' => ChatSession::where('status', 'bot')->count(),
            'human' => ChatSession::where('status', 'human')->count(),
            'closed' => ChatSession::where('status', 'closed')->count(),
        ];

        return Inertia::render('admin/chat/index', [
            'sessions' => $sessions,
            'stats' => $stats,
        ]);
    }

    public function show(ChatSession $chatSession): Response
    {
        $chatSession->load('messages');

        return Inertia::render('admin/chat/show', [
            'session' => [
                'id' => $chatSession->id,
                'token' => $chatSession->token,
                'visitor_name' => $chatSession->visitor_name,
                'visitor_email' => $chatSession->visitor_email,
                'status' => $chatSession->status,
                'last_activity_at' => $chatSession->last_activity_at?->toIso8601String(),
                'created_at' => $chatSession->created_at->toIso8601String(),
                'messages' => $chatSession->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'sender' => $m->sender,
                    'message' => $m->message,
                    'created_at' => $m->created_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function reply(Request $request, ChatSession $chatSession): RedirectResponse
    {
        $request->validate(['message' => 'required|string|max:2000']);

        ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'sender' => 'admin',
            'message' => $request->message,
        ]);

        $chatSession->update(['last_activity_at' => now()]);

        return back()->with('success', 'Pesan terkirim.');
    }

    public function takeover(ChatSession $chatSession): RedirectResponse
    {
        $chatSession->update(['status' => 'human']);

        ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'sender' => 'admin',
            'message' => 'Halo! Anda sekarang terhubung dengan tim support kami. Ada yang bisa kami bantu?',
        ]);

        return back()->with('success', 'Alih ke mode human berhasil.');
    }

    public function close(ChatSession $chatSession): RedirectResponse
    {
        $chatSession->update(['status' => 'closed']);

        ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'sender' => 'admin',
            'message' => 'Sesi chat telah ditutup. Terima kasih telah menghubungi GrowRich! 😊',
        ]);

        return back()->with('success', 'Sesi chat ditutup.');
    }

    public function messages(Request $request, ChatSession $chatSession): JsonResponse
    {
        $since = $request->query('since');
        $query = $chatSession->messages();

        if ($since) {
            $query->where('id', '>', (int) $since);
        }

        $messages = $query->get()->map(fn ($m) => [
            'id' => $m->id,
            'sender' => $m->sender,
            'message' => $m->message,
            'created_at' => $m->created_at->toIso8601String(),
        ]);

        return response()->json([
            'messages' => $messages,
            'status' => $chatSession->status,
        ]);
    }
}
