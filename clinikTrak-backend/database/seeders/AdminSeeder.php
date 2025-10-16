<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create the system admin user (Built-in system administrator)
        $superAdmin = User::firstOrCreate(
            ['email' => 'sysadmin@gov.co.ls'],
            [
                'password' => Hash::make('makoanyane@123'),
                'status' => 'active',
            ]
        );

        // Assigns role to the super admin user
        if (!$superAdmin->hasRole('admin')) {
            $superAdmin->assignRole('admin');
        }
    }
}
