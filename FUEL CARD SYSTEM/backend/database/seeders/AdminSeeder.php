<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'password' => Hash::make('superpassword123'),
                'role' => 'super_admin',
                'station_location' => 'Headquarters',
            ]
        );

        Admin::updateOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('password123'),
                'role' => 'station_admin',
                'station_location' => 'Kirkuk Central Station',
            ]
        );
    }
}
