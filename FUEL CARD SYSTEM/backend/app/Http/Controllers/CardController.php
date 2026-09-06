<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Services\FuelCooldownService;
use Illuminate\Http\JsonResponse;

class CardController extends Controller
{
    public function __construct(
        private FuelCooldownService $cooldownService
    ) {}

    public function status(string $card_id): JsonResponse
    {
        $cardId = str_pad((string)$card_id, 6, '0', STR_PAD_LEFT);
        $card = Card::where('card_id', $cardId)->first();

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $status = $this->cooldownService->checkEligibility($card);
        $status['card_id'] = $card->card_id;

        return response()->json($status, $status['eligible'] ? 200 : 403);
    }
}
