<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function session(Request $request): JsonResponse
    {
        $token = $request->header('X-Chat-Token') ?: Str::random(40);
        $session = ChatSession::findOrCreateByToken($token);

        if ($session->wasRecentlyCreated) {
            ChatMessage::create([
                'chat_session_id' => $session->id,
                'sender' => 'bot',
                'message' => 'Halo! 👋 Selamat datang di GrowRich. Ada yang bisa saya bantu?',
            ]);
        }

        return response()->json([
            'token' => $session->token,
            'status' => $session->status,
            'messages' => $session->messages->map(fn ($m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'message' => $m->message,
                'created_at' => $m->created_at->toIso8601String(),
            ]),
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $token = $request->header('X-Chat-Token');

        if (! $token) {
            return response()->json(['error' => 'No session token'], 400);
        }

        $session = ChatSession::findOrCreateByToken($token);

        if ($session->status === 'closed') {
            return response()->json(['error' => 'Chat ditutup'], 400);
        }

        $userMessage = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'user',
            'message' => $request->message,
        ]);

        $session->update(['last_activity_at' => now()]);

        if ($session->isBot()) {
            $reply = $this->getAiReply($session, $request->message);

            $botMessage = ChatMessage::create([
                'chat_session_id' => $session->id,
                'sender' => 'bot',
                'message' => $reply,
            ]);

            return response()->json([
                'userMessageId' => $userMessage->id,
                'reply' => [
                    'id' => $botMessage->id,
                    'sender' => 'bot',
                    'message' => $botMessage->message,
                    'created_at' => $botMessage->created_at->toIso8601String(),
                ],
            ]);
        }

        return response()->json([
            'userMessageId' => $userMessage->id,
            'reply' => null,
        ]);
    }

    public function messages(Request $request): JsonResponse
    {
        $token = $request->header('X-Chat-Token');

        if (! $token) {
            return response()->json(['messages' => [], 'status' => 'bot']);
        }

        $session = ChatSession::where('token', $token)->first();

        if (! $session) {
            return response()->json(['messages' => [], 'status' => 'bot']);
        }

        $since = $request->query('since');
        $query = $session->messages();

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
            'status' => $session->status,
        ]);
    }

    private function getAiReply(ChatSession $session, string $userMessage): string
    {
        try {
            $greetingMessage = 'Halo! 👋 Selamat datang di GrowRich. Ada yang bisa saya bantu?';
            $systemPrompt = 'Kamu adalah asisten AI GrowRich, platform ekosistem MLM modern yang menjual produk air hidrogen berkualitas tinggi. Tugasmu membantu calon member dan pengunjung website dengan pertanyaan tentang: produk air hidrogen, paket bergabung, sistem bonus MLM (sponsor, pairing, matching, leveling, repeat order, global sharing), cara mendaftar, dan informasi umum GrowRich. Jawab dalam Bahasa Indonesia dengan ramah, informatif, dan singkat (maks 3-4 kalimat). Jika pertanyaan di luar konteks GrowRich, arahkan dengan sopan.';

            $history = $session->messages()
                ->whereIn('sender', ['user', 'bot'])
                ->where('message', '!=', $greetingMessage)
                ->latest()
                ->limit(10)
                ->get()
                ->reverse()
                ->map(fn ($m) => [
                    'role' => $m->sender === 'user' ? 'user' : 'assistant',
                    'content' => $m->message,
                ])
                ->values()
                ->toArray();

            $response = Http::withToken(config('services.openai.key'))
                ->timeout(15)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => array_merge(
                        [['role' => 'system', 'content' => $systemPrompt]],
                        $history
                    ),
                    'max_tokens' => 250,
                    'temperature' => 0.7,
                ]);

            return $response->json('choices.0.message.content')
                ?? 'Maaf, saya sedang tidak bisa merespons. Silakan coba lagi.';
        } catch (\Throwable $e) {
            return 'Maaf, terjadi gangguan. Tim kami akan segera membantu Anda.';
        }
    }
}
