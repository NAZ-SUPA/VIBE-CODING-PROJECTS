<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Transaction;
use App\Services\FuelCooldownService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function __construct(
        private FuelCooldownService $cooldownService
    ) {}

    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'card_id' => 'required|string|size:6',
            'fuel_type' => 'required|in:gas,oil',
        ]);

        $card_id = $request->input('card_id');
        $fuel_type = $request->input('fuel_type');
        $admin = $request->user();

        if ($admin->role !== 'station_admin') {
            return response()->json([
                'message' => 'Unauthorized. Only station administrators can dispense fuel.'
            ], 403);
        }

        return DB::transaction(function () use ($card_id, $fuel_type, $admin) {
            $card = Card::where('card_id', $card_id)->lockForUpdate()->first();

            if (!$card) {
                return response()->json(['message' => 'Card not found'], 404);
            }

            $status = $this->cooldownService->checkEligibility($card);

            if (!$status['eligible']) {
                return response()->json([
                    'message' => $status['message'],
                    'days_remaining' => $status['days_remaining']
                ], 403);
            }

            Transaction::create([
                'card_id' => $card->card_id,
                'admin_id' => $admin->id,
                'fuel_type' => $fuel_type,
            ]);

            $card->update([
                'last_used_date' => Carbon::now(),
                'last_fuel_type' => $fuel_type,
            ]);

            return response()->json(['message' => 'Transaction successful'], 200);
        });
    }
}
