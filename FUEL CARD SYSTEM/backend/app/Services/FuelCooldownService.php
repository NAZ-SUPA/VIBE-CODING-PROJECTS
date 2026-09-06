<?php

namespace App\Services;

use App\Models\Card;
use Carbon\Carbon;

class FuelCooldownService
{
    /**
     * Check if a card is currently on cooldown.
     * Returns an array with 'eligible', 'days_remaining' (if not eligible), and 'message'.
     */
    public function checkEligibility(Card $card): array
    {
        if (!$card->last_used_date) {
            return [
                'status' => 'eligible',
                'eligible' => true,
                'message' => 'Card is eligible for fuel purchase.',
                'days_remaining' => 0
            ];
        }

        $lastUsed = Carbon::parse($card->last_used_date);
        $nextEligibleDate = $lastUsed->copy()->addDays(7);
        $now = Carbon::now();

        if ($now->lessThan($nextEligibleDate)) {
            // Calculate float difference in days and apply ceiling rounding
            $daysRemaining = (int) ceil($now->floatDiffInDays($nextEligibleDate));
            
            return [
                'status' => 'blocked',
                'eligible' => false,
                'message' => 'Card is currently blocked.',
                'days_remaining' => $daysRemaining,
                'available_date' => $nextEligibleDate->format('Y-m-d'),
                'available_readable' => $nextEligibleDate->format('F j, Y'),
                'next_eligible_date' => $nextEligibleDate->toDateTimeString()
            ];
        }

        return [
            'status' => 'eligible',
            'eligible' => true,
            'message' => 'Card is eligible for fuel purchase.',
            'days_remaining' => 0
        ];
    }
}
