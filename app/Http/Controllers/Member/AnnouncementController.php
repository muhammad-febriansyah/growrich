<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::visible()
            ->pinnedFirst()
            ->paginate(10);

        return Inertia::render('member/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Announcement $announcement): Response
    {
        abort_unless($announcement->is_active && $announcement->published_at?->isPast(), 404);

        return Inertia::render('member/announcements/show', [
            'announcement' => $announcement,
        ]);
    }
}
