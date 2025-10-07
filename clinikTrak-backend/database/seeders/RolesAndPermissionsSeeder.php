<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions (MVP level)
        $permissions = [
            'manage appointments',
            'book appointments',
            'approve appointments',
            'create prescriptions',
            'view prescriptions',
            'share medical records',
            'view medical records',
            'on-call duty',
            'dispense medication',
            'manage inventory',
            'request ambulance',
            'approve ambulance request',
            'track ambulance',
            'manage users',
            'view reports',
            'view audit logs',
        ];

        // Create permissions first
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Define roles and their permissions
        $roles = [
            'patient' => [
                'request ambulance',
                'book appointments',
                'view prescriptions',
                'share medical records',
            ],
            'doctor' => [
                'manage appointments',
                'approve appointments',
                'create prescriptions',
                'view medical records',
                'on-call duty',
                'share medical records',
            ],
            'pharmacist' => [
                'dispense medication',
                'manage inventory',
                'view prescriptions',
            ],
            'ambulance-driver' => [
                'track ambulance',
                'approve ambulance request',
            ],
            'admin' => [
                'manage users',
                'view reports',
                'view audit logs',
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($perms);
        }
    }
}
