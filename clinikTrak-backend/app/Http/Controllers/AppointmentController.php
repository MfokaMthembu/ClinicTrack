<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'preferred_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'required',
            'doctor_types'   => 'required|array|min:1',
            'reason'         => 'required|string|max:1000',
        ]);

        $appointment = Appointment::create([
            'patient_id'        => auth()->user()->patient_id,
            'doctor_employee_id'=> null, // Will be assigned when doctor accepts
            'preferred_date'    => $validated['preferred_date'],
            'preferred_time'    => $validated['preferred_time'],
            'doctor_types'      => $validated['doctor_types'],
            'reason'            => $validated['reason'],
            'status'            => 'pending',
        ]);

        return response()->json([
            'message' => 'Appointment request submitted successfully! A doctor will review it soon.',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Get pending appointments matching doctor's specialization
     */
    public function getPendingAppointments(Request $request)
    {
        $doctor = auth()->user()->employee;
        
        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $specialization = $doctor->specialization;

        // Get appointments where:
        // 1. Status is pending
        // 2. No doctor assigned yet
        // 3. The requested doctor_types includes this doctor's specialization OR general
        $appointments = Appointment::where('status', 'pending')
            ->whereNull('doctor_employee_id')
            ->where(function($query) use ($specialization) {
                $query->whereJsonContains('doctor_types', $specialization)
                    ->orWhereJsonContains('doctor_types', 'general');
            })
            ->with('patient.user')
            ->orderBy('preferred_date', 'asc')
            ->orderBy('preferred_time', 'asc')
            ->get();

        return response()->json([
            'appointments' => $appointments->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'preferred_date' => $appt->preferred_date,
                    'preferred_time' => $appt->preferred_time,
                    'reason' => $appt->reason,
                    'status' => $appt->status,
                    'doctor_types' => $appt->doctor_types,
                    'patient_name' => $appt->patient?->user?->name,
                ];
            }),
            'count' => $appointments->count(),
]);

    }

    /**
     * Doctor accepts and claims an appointment
     */
    public function acceptAppointment(Request $request, $id)
    {
        $doctor = auth()->user()->employee;
        if (!$doctor) {
            return response()->json(['success' => false, 'message' => 'Doctor profile not found'], 404);
        }

        $appointment = Appointment::where('id', $id)
            ->where('status', 'pending')
            ->whereNull('doctor_employee_id')
            ->first();

        if (!$appointment) {
            return response()->json(['success' => false, 'message' => 'Appointment not found or already assigned'], 404);
        }

        $specialization = $doctor->specialization;
        $doctorTypes = $appointment->doctor_types;

        if (!in_array($specialization, $doctorTypes) && !in_array('general', $doctorTypes)) {
            return response()->json(['success' => false, 'message' => 'This appointment requires a different specialization'], 403);
        }

        // ✅ assign doctor correctly
        $appointment->update([
            'doctor_employee_id' => $doctor->id,
            'status' => 'approved',
        ]);

        // ✅ reload with both doctor and patient details
        $appointment->load(['patient.user', 'doctor']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment accepted successfully!',
            'appointment' => [
                'id' => $appointment->id,
                'preferred_date' => $appointment->preferred_date,
                'preferred_time' => $appointment->preferred_time,
                'reason' => $appointment->reason,
                'status' => $appointment->status,
                'doctor_name' => $appointment->doctor?->name,
                'patient_name' => $appointment->patient?->user?->name,
            ],
        ], 200);
    }


    /**
     * Doctor rejects an appointment
     */
    public function rejectAppointment(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $appointment = Appointment::findOrFail($id);

        $appointment->update([
            'status' => 'cancelled',
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment rejected successfully!',
            'appointment' => $appointment,
        ], 200);
    }


    /**
     * Get all appointments for the authenticated patient
     */
    public function getPatientAppointments(Request $request)
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        // Fetch all appointments for this patient, with doctor & patient info
        $appointments = Appointment::where('patient_id', $patient->id)
            ->with(['doctor', 'patient'])
            ->orderBy('preferred_date', 'desc')
            ->orderBy('preferred_time', 'desc')
            ->get();

        // Group appointments by status
        $groupedAppointments = [
            'pending'   => $appointments->where('status', 'pending')->values(),
            'confirmed' => $appointments->where('status', 'approved')->values(),
            'completed' => $appointments->where('status', 'completed')->values(),
            'rejected'  => $appointments->where('status', 'rejected')->values(),
            'cancelled' => $appointments->where('status', 'cancelled')->values(),
        ];

        // ✅ Flatten data for frontend (with names resolved)
        $formattedAppointments = $appointments->map(function ($appt) {
            return [
                'id'              => $appt->id,
                'preferred_date'  => $appt->preferred_date,
                'preferred_time'  => $appt->preferred_time,
                'reason'          => $appt->reason,
                'status'          => $appt->status,
                'doctor_types'    => $appt->doctor_types,
                'doctor_name'     => $appt->doctor?->name,            // ✅ doctor name (if assigned)
                'patient_name'    => $appt->patient?->name,    // ✅ always include patient name
            ];
        });

        return response()->json([
            'appointments'      => $formattedAppointments,
            'grouped'           => $groupedAppointments,
            'total'             => $appointments->count(),
            'pending_count'     => $groupedAppointments['pending']->count(),
            'confirmed_count'   => $groupedAppointments['confirmed']->count(),
        ], 200);
    }


    /**
     * Get only pending appointments for the authenticated patient
     */
    public function getPendingPatientAppointments(Request $request)
    {
        $patient = auth()->user()->patient;
        
        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $appointments = Appointment::where('patient_id', $patient->id)
            ->where('status', 'pending')
            ->with(['doctor.user'])
            ->orderBy('preferred_date', 'asc')
            ->orderBy('preferred_time', 'asc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
            'count' => $appointments->count(),
        ], 200);
    }

    /**
    * Patient cancels their own appointment
    */
    public function cancelAppointment(Request $request, $id)
    {
        $patient = auth()->user()->patient;
        
        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if (!$appointment) {
            return response()->json([
                'message' => 'Appointment not found or cannot be cancelled'
            ], 404);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'appointment' => $appointment,
        ], 200);
    }
}
