<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Card;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(AdminSeeder::class);

        // Create 5 Test Cards
        $cards = ['111111', '222222', '333333', '444444', '555555'];
        
        foreach ($cards as $card_id) {
            Card::create([
                'card_id' => $card_id,
            ]);
        }
    }
}
