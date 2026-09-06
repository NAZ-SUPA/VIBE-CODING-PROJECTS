<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedCards extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:seed-cards';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with 1,000,000 possible 6-digit cards.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting bulk insertion of 1,000,000 cards...');

        $chunkSize = 10000;
        $totalCards = 1000000;
        $now = now();

        $bar = $this->output->createProgressBar($totalCards / $chunkSize);
        $bar->start();

        DB::disableQueryLog();

        for ($i = 0; $i < $totalCards; $i += $chunkSize) {
            $chunk = [];
            for ($j = 0; $j < $chunkSize; $j++) {
                $number = $i + $j;
                $card_id = str_pad((string)$number, 6, '0', STR_PAD_LEFT);
                $chunk[] = [
                    'card_id' => $card_id,
                    'last_used_date' => null,
                    'last_fuel_type' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            DB::table('cards')->insert($chunk);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Successfully seeded 1,000,000 cards!');
    }
}
