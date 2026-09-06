<?php

namespace App\Console\Commands;

use App\Models\Admin;
use App\Models\Card;
use App\Models\Transaction;
use Illuminate\Console\Command;

class InspectDb extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:inspect-db';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Inspect database statistics (cards count, registered admins, logged transactions)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('====================================');
        $this->info('    DATABASE INSPECTION REPORT      ');
        $this->info('====================================');

        // 1. Total Cards Count
        $cardCount = Card::count();
        $this->line("<comment>Total Cards in Database:</comment> " . number_format($cardCount));

        // 2. Total Transactions Logged
        $transactionCount = Transaction::count();
        $this->line("<comment>Total Transactions Logged:</comment> " . number_format($transactionCount));

        // 3. Registered Admins List
        $admins = Admin::all(['username', 'station_location']);
        $this->newLine();
        $this->info("Registered Administrators ({$admins->count()}):");

        if ($admins->isEmpty()) {
            $this->warn('  No registered admins found.');
        } else {
            $headers = ['Username', 'Station Location'];
            $rows = $admins->map(fn ($admin) => [
                'username' => $admin->username,
                'station_location' => $admin->station_location,
            ])->toArray();

            $this->table($headers, $rows);
        }

        $this->info('====================================');

        return Command::SUCCESS;
    }
}
