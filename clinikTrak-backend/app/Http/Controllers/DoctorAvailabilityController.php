<?php

namespace App\Http\Controllers;

use App\Models\DoctorAvailability;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorAvailabilityController extends Controller {

    /**
     * Get doctor's availability schedule
     */
    public function getDoctorAvailability(Request $request)
    {
        $doctor = auth()->user()->employee;
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $availability = DoctorAvailability::where('employee_id', $doctor->id)
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'availability' => $availability,
        ], 200);
    }

    /**
     * Create availability slot
     */
    public function storeDoctorAvailability(Request $request)
    {
        $doctor = auth()->user()->employee;
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // Check for overlapping slots
        $overlap = DoctorAvailability::where('employee_id', $doctor->id)
            ->where('date', $validated['date'])
            ->where(function($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhere(function($q) use ($validated) {
                        $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                    });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'This time slot overlaps with existing availability'
            ], 422);
        }

        $availability = DoctorAvailability::create([
            'employee_id' => $doctor->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Availability slot created successfully',
            'availability' => $availability,
        ], 201);
    }

    /**
     * Delete availability slot
     */
    public function deleteDoctorAvailability(Request $request, $id)
    {
        $doctor = auth()->user()->employee;
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $availability = DoctorAvailability::where('id', $id)
            ->where('employee_id', $doctor->id)
            ->first();

        if (!$availability) {
            return response()->json(['message' => 'Availability slot not found'], 404);
        }

        $availability->delete();

        return response()->json([
            'message' => 'Availability slot deleted successfully'
        ], 200);
    }


    /**
     * Get doctors by specialization (for patients)
     */
    public function getDoctorsBySpecialization(Request $request)
    {
        $validated = $request->validate([
            'specialization' => 'required|string',
        ]);

        // Start from the User model since it holds the foreign key
        $doctors = User::whereHas('roles', fn($q) => $q->where('name', 'doctor'))
            ->whereHas('employee', fn($q) => $q->where('specialization', $validated['specialization']))
            ->with([
                'employee' => function ($query) {
                    $query->select('id', 'name', 'surname', 'specialization', 'rank', 'phone_number');
                },
            ])
            ->get(['id', 'email', 'status', 'employee_id']);

        return response()->json([
            'doctors' => $doctors,
            'count'   => $doctors->count(),
        ], 200);
    }



    /**
     * Get a specific doctor's availability (for patients to view)
     */
    public function getPublicDoctorAvailability($id)
{
    // ✅ Find doctor user and ensure it’s really a doctor
    $user = User::with('employee')
        ->whereHas('roles', fn($q) => $q->where('name', 'doctor'))
        ->findOrFail($id);

    // ✅ Ensure linked employee exists
    if (!$user->employee) {
        return response()->json([
            'message' => 'No employee profile found for this doctor.',
            'availability' => [],
        ], 404);
    }

        // ✅ Fetch doctor’s availability safely
        $availability = DoctorAvailability::where('employee_id', $user->employee->id)
        ->whereDate('date', '>=', now()->toDateString()) // ✅ only two arguments
        ->where('is_active', true)
        ->orderBy('date', 'asc')
        ->orderBy('start_time', 'asc')
        ->get([
            'id',
            'employee_id',
            'date',
            'start_time',
            'end_time',
            'is_active',
        ]);

    // ✅ Log missing data for debugging
    if ($availability->isEmpty()) {
        \Log::info("No availability found for employee_id: " . $user->employee->id);
    }

    // ✅ Return minimal, frontend-friendly structure
    return response()->json([
        'doctor' => [
            'id' => $user->id,
            'name' => $user->employee->name,
            'surname' => $user->employee->surname,
            'specialization' => $user->employee->specialization,
        ],
        'availability' => $availability->map(function ($slot) {
            return [
                'id' => $slot->id,
                'date' => $slot->date instanceof \Carbon\Carbon ? $slot->date->toDateString() : $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_active' => (bool) $slot->is_active,
            ];
        }),
    ], 200);
}





    
}