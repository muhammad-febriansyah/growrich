<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'How do I register a new member?',
                'answer' => 'To register a new member, you need a Registration PIN. Go to Member -> Register and fill in the required details including the PIN.',
            ],
            [
                'question' => 'What are the benefits of the GrowRich MLM system?',
                'answer' => 'GrowRich offers various bonuses including referral bonuses, pairing bonuses, and rewards milestones to help you grow your wealth.',
            ],
            [
                'question' => 'How can I withdraw my earnings?',
                'answer' => 'You can request a withdrawal from your wallet. Go to Financial -> Wallet and click on Withdraw. Admin will process your request.',
            ],
            [
                'question' => 'How do I purchase products?',
                'answer' => 'Currently, products are purchased through the Repeat Order (RO) system. You can view available products and place an order in the RO section.',
            ],
            [
                'question' => 'What is a Registration PIN?',
                'answer' => 'A Registration PIN is a unique code required to register a member. PINs can be obtained from the admin or through pin generation (for certain roles).',
            ],
            [
                'question' => 'How are pairing bonuses calculated?',
                'answer' => 'Pairing bonuses are calculated based on the balanced points between your left and right network legs.',
            ],
            [
                'question' => 'Can I change my sponsor?',
                'answer' => 'Generally, sponsors cannot be changed once a member is registered to maintain the integrity of the network structure.',
            ],
            [
                'question' => 'Where can I find my referral link?',
                'answer' => 'Your referral code is available in your profile. You can share this code with potential new members.',
            ],
            [
                'question' => 'What should I do if I forget my password?',
                'answer' => 'You can use the "Forgot Password" link on the login page to reset your password via your registered email.',
            ],
            [
                'question' => 'How do I contact support?',
                'answer' => 'You can reach out to our support team through the contact details provided in the Site Settings or footer of the application.',
            ],
        ];

        foreach ($faqs as $index => $faq) {
            \App\Models\Faq::create([
                ...$faq,
                'is_published' => true,
                'sort_order' => $index,
            ]);
        }
    }
}
