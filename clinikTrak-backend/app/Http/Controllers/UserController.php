<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
    * method to get all users
    */
    public function getUsers()
    {
        $users = User::with(['patient', 'employee', 'roles'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
                    'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'patient',
                    'status' => $user->status,
                ];
            });

        return response()->json($users);
    }

    /**
     * Method to show a specific user by ID
     */
    public function getUser($id)
    {
        $user = User::with(['patient', 'employee', 'roles'])->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
            'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
            'email' => $user->email,
            'role' => $user->roles->pluck('name')->first() ?? 'patient',
            'status' => $user->status,
        ]);
    }

    /**
     * Get the currently logged-in user
     */
    public function getCurrentUser()
    {
        $user = auth()->user()->load(['patient', 'employee', 'roles']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
            'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
            'email' => $user->email,
            'role' => $user->roles->pluck('name')->first() ?? 'patient',
            'status' => $user->status,
        ]);
    }


    /**
     * Get user details for editing
     */
public function showDetails($id)
{
    $user = User::with(['patient', 'employee'])->findOrFail($id);

    return response()->json([
        'id' => $user->id,
        'name' => $user->employee->name ?? $user->patient->name ?? '',
        'surname' => $user->employee->surname ?? $user->patient->surname ?? '',
        'email' => $user->email,
        'status' => $user->status,
        'role' => $user->roles->first()->name ?? '',
    ]);
}

// Update user info
public function updateUser(Request $request, $id)
{
    $user = User::findOrFail($id);
    $user->update([
        'email' => $request->email,
        'status' => $request->status,
    ]);

    if ($user->employee) {
        $user->employee->update([
            'name' => $request->name,
            'surname' => $request->surname,
        ]);
    } elseif ($user->patient) {
        $user->patient->update([
            'name' => $request->name,
            'surname' => $request->surname,
        ]);
    }

    if ($request->has('role')) {
        $user->syncRoles([$request->role]);
    }

    return response()->json(['message' => 'User updated successfully']);
}


    /**
    *  Delete user method
    */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Approve a user based on their department and assign appropriate role
     */
    public function approveUser($id)
    {
        $user = User::findOrFail($id);

        if (!$user->employee_id) {
            return response()->json(['message' => 'Only staff accounts can be approved'], 400);
        }

        $employee = $user->employee;

        $roleMap = [
            'General Medicine' => 'doctor',
            'Emergency Services'   => 'ambulance-driver',
            'Pharmacy'             => 'pharmacist',
        ];

        $departmentName = $employee->department->name;

        if (!isset($roleMap[$departmentName])) {
            return response()->json(['message' => 'Department role not defined'], 400);
        }

        $user->update(['status' => 'active']);
        $user->syncRoles([$roleMap[$departmentName]]); 

        return response()->json([
            'message' => 'User approved and role assigned successfully',
            'user'    => $user->fresh(['patient','employee','roles']),
        ]);
    }


    /**
     * Disapprove a user and set their status to suspended
     */
    public function disapproveUser($id)
    {
        $user = User::findOrFail($id);

        if (!$user->employee_id) {
            return response()->json(['message' => 'Only staff accounts can be disapproved'], 400);
        }

        $user->update(['status' => 'suspended']);
        $user->syncRoles([]); 

        return response()->json([
            'message' => 'User disapproved successfully',
            'user'    => $user->fresh(['patient','employee','roles']),
        ]);
    }

    /**
     * Search users by name, surname, email or role
     */
    public function searchUsers(Request $request)
    {
        $query = $request->query('query'); // get ?query= from frontend
        $users = User::with(['patient', 'employee', 'roles'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
                    'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'patient',
                    'status' => $user->status,
                ];
            })
            ->filter(function($user) use ($query) {
                return str_contains(strtolower($user['name'] ?? ''), strtolower($query))
                    || str_contains(strtolower($user['surname'] ?? ''), strtolower($query))
                    || str_contains(strtolower($user['email'] ?? ''), strtolower($query))
                    || str_contains(strtolower($user['role'] ?? ''), strtolower($query));
            })
            ->values();

        return response()->json($users);
    }


    /**
    *  Method to filter by role and status
    */
    public function filterUsers(Request $request)
    {
        $role   = $request->input('role');
        $status = $request->input('status');

        $users = User::with(['patient', 'employee', 'roles'])
            ->when($role, function ($q) use ($role) {
                $q->whereHas('roles', function ($qr) use ($role) {
                    $qr->where('name', $role);
                });
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
                    'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'patient',
                    'status' => $user->status,
                ];
            });

        return response()->json($users);
    }

    /**
    *  Method to sort by user_id, role & name
    */
    public function sortUsers(Request $request)
    {
        $sortBy    = $request->input('sortBy', 'id');   // default sort by id
        $direction = $request->input('direction', 'asc');

        $validSorts = ['id', 'role', 'name'];
        if (!in_array($sortBy, $validSorts)) {
            return response()->json(['message' => 'Invalid sort field'], 400);
        }

        $users = User::with(['patient', 'employee', 'roles'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->patient ? $user->patient->name : ($user->employee ? $user->employee->name : null),
                    'surname' => $user->patient ? $user->patient->surname : ($user->employee ? $user->employee->surname : null),
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'patient',
                    'status' => $user->status,
                ];
            });

        // apply sorting in collection
        $sorted = $users->sortBy($sortBy, SORT_REGULAR, $direction === 'desc')->values();

        return response()->json($sorted);
    }

}