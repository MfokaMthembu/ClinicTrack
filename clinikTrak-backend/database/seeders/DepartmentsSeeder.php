<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'General Medicine', 'description' => 'Doctors and consultations'],
            ['name' => 'Pharmacy', 'description' => 'Medication and stock management'],
            ['name' => 'Emergency Services', 'description' => 'Ambulance drivers and dispatchers'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['name' => $dept['name']], $dept);
        }
    }
}
