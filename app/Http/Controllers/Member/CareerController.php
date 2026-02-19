<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\CareerLevel;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CareerController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return redirect()->route('dashboard')->with('error', 'Profil member tidak ditemukan.');
        }

        $currentLevel = $profile->career_level instanceof CareerLevel
            ? $profile->career_level
            : CareerLevel::from($profile->career_level);

        $leftPp = (int) $profile->left_pp_total;
        $rightPp = (int) $profile->right_pp_total;
        $smallerLeg = min($leftPp, $rightPp);

        // Build all levels with progress info
        $levels = array_map(function (CareerLevel $level) use ($currentLevel, $smallerLeg) {
            $required = $level->requiredPp();

            return [
                'value' => $level->value,
                'label' => $level->label(),
                'requiredPp' => $required,
                'isCurrent' => $level === $currentLevel,
                'isAchieved' => $smallerLeg >= $required,
                'sortOrder' => $level->sortOrder(),
            ];
        }, CareerLevel::cases());

        // Next level
        $nextLevel = null;
        foreach (CareerLevel::cases() as $level) {
            if ($level->sortOrder() === $currentLevel->sortOrder() + 1) {
                $nextLevel = $level;
                break;
            }
        }

        return Inertia::render('member/career/index', [
            'currentLevel' => [
                'value' => $currentLevel->value,
                'label' => $currentLevel->label(),
                'requiredPp' => $currentLevel->requiredPp(),
            ],
            'nextLevel' => $nextLevel ? [
                'value' => $nextLevel->value,
                'label' => $nextLevel->label(),
                'requiredPp' => $nextLevel->requiredPp(),
            ] : null,
            'leftPp' => $leftPp,
            'rightPp' => $rightPp,
            'smallerLeg' => $smallerLeg,
            'levels' => $levels,
        ]);
    }
}
