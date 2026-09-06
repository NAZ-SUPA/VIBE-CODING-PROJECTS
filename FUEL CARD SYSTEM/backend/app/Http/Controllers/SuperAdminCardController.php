<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Services\FuelCooldownService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminCardController extends Controller
{
    public function __construct(
        private FuelCooldownService $cooldownService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Card::query();

        if ($request->has('card_id') && !empty($request->card_id)) {
            $query->where('card_id', 'like', '%' . $request->card_id . '%');
        }

        $cards = $query->orderBy('created_at', 'desc')->paginate(15);

        // Append real-time status to each card
        $cards->getCollection()->transform(function ($card) {
            $status = $this->cooldownService->checkEligibility($card);
            $card->status = $status;
            return $card;
        });

        return response()->json($cards);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'card_id' => 'required|string|size:6|regex:/^[0-9]+$/|unique:cards,card_id',
        ]);

        $card = Card::create([
            'card_id' => $request->card_id,
            'last_used_date' => null,
            'last_fuel_type' => null,
        ]);

        return response()->json(['message' => 'Card issued successfully', 'card' => $card], 201);
    }

    public function destroy(string $card_id): JsonResponse
    {
        $card = Card::where('card_id', $card_id)->firstOrFail();

        if ($card->transactions()->exists()) {
            return response()->json(['message' => 'Cannot delete card. It has existing transactions.'], 403);
        }

        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }
}
