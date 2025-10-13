<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Appointment;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    // Doctor creates prescription after appointment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'consultation_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.dosage_instructions' => 'nullable|string',
        ]);

        // Get the appointment to verify it belongs to this doctor
        $appointment = Appointment::findOrFail($validated['appointment_id']);
        
        // Verify the doctor is authorized for this appointment
        if ($appointment->doctor_employee_id !== auth()->user()->employee->id) {
            return response()->json([
                'message' => 'Unauthorized: This appointment is not assigned to you'
            ], 403);
        }

        // Create the prescription
        $prescription = Prescription::create([
            'appointment_id' => $validated['appointment_id'],
            'doctor_employee_id' => auth()->user()->employee->id,
            'patient_id' => $appointment->patient_id, // Get patient_id from appointment
            'consultation_notes' => $validated['consultation_notes'] ?? '',
            'status' => 'pending',
        ]);

        // Create prescription items
        foreach ($validated['items'] as $item) {
            PrescriptionItem::create([
                'prescription_id' => $prescription->id,
                'medicine_id' => $item['medicine_id'],
                'quantity' => $item['quantity'],
                'dosage_instructions' => $item['dosage_instructions'] ?? null,
            ]);
        }

        // ✅ Update appointment status to completed
        $appointment->update([
            'status' => 'completed'
        ]);

        return response()->json([
            'message' => 'Prescription created successfully and appointment marked as completed',
            'prescription' => $prescription->load('items.medicine'),
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Get all approved appointments for the authenticated doctor
     */
    public function getDoctorApprovedAppointments(Request $request)
    {
        $doctor = auth()->user()->employee;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        // Fetch approved appointments assigned to this doctor
        $appointments = Appointment::where('doctor_employee_id', $doctor->id)
            ->where('status', 'approved')
            ->with(['patient'])
            ->orderBy('preferred_date', 'desc')
            ->orderBy('preferred_time', 'desc')
            ->get();

        $formattedAppointments = $appointments->map(function ($appt) {
            return [
                'id'              => $appt->id,
                'preferred_date'  => $appt->preferred_date,
                'preferred_time'  => $appt->preferred_time,
                'reason'          => $appt->reason,
                'status'          => $appt->status,
                'patient_name'    => $appt->patient?->name,
                'patient_surname' => $appt->patient?->surname,
                'patient_dob'     => $appt->patient?->dob,
                'patient_gender'  => $appt->patient?->gender,
                'medical_history' => $appt->patient?->medical_history,
                'attachment_path' => $appt->patient?->attachment_path,
            ];
        });

        return response()->json([
            'appointments' => $formattedAppointments,
            'total'        => $appointments->count(),
        ], 200);
    }

    /**
     * Search approved appointments for the authenticated doctor
     */
    public function searchDoctorApprovedAppointments(Request $request)
    {
        $doctor = auth()->user()->employee;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $searchQuery = $request->input('search', '');

        if (empty($searchQuery)) {
            return response()->json([
                'appointments' => [],
                'total'        => 0,
                'message'      => 'Please provide a search query'
            ], 400);
        }

        // Search approved appointments
        $appointments = Appointment::where('doctor_employee_id', $doctor->id)
            ->where('status', 'approved')
            ->with(['patient'])
            ->where(function ($query) use ($searchQuery) {
                $query->whereHas('patient', function ($q) use ($searchQuery) {
                    $q->where('name', 'like', "%{$searchQuery}%")
                    ->orWhere('surname', 'like', "%{$searchQuery}%")
                    ->orWhere('medical_history', 'like', "%{$searchQuery}%");
                })
                ->orWhere('id', 'like', "%{$searchQuery}%")
                ->orWhere('reason', 'like', "%{$searchQuery}%")
                ->orWhere('preferred_date', 'like', "%{$searchQuery}%");
            })
            ->orderBy('preferred_date', 'desc')
            ->orderBy('preferred_time', 'desc')
            ->get();

        $formattedAppointments = $appointments->map(function ($appt) {
            return [
                'id'              => $appt->id,
                'preferred_date'  => $appt->preferred_date,
                'preferred_time'  => $appt->preferred_time,
                'reason'          => $appt->reason,
                'status'          => $appt->status,
                'patient_name'    => $appt->patient?->name,
                'patient_surname' => $appt->patient?->surname,
                'patient_dob'     => $appt->patient?->dob,
                'patient_gender'  => $appt->patient?->gender,
                'medical_history' => $appt->patient?->medical_history,
                'attachment_path' => $appt->patient?->attachment_path,
            ];
        });

        return response()->json([
            'appointments' => $formattedAppointments,
            'total'        => $appointments->count(),
            'search_query' => $searchQuery,
        ], 200);
    }

    /**
     * Get all pending prescriptions for the authenticated patient
     */
    public function getPatientPrescriptions(Request $request)
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        // Fetch pending prescriptions for this patient
        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->where('status', 'pending')
            ->with([
                'doctor', 
                'appointment',
                'items.medicine'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedPrescriptions = $prescriptions->map(function ($prescription) {
            return [
                'id' => $prescription->id,
                'consultation_notes' => $prescription->consultation_notes,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
                'doctor_name' => $prescription->doctor?->name,
                'doctor_surname' => $prescription->doctor?->surname,
                'patient_name' => $prescription->patient?->name,
                'patient_surname' => $prescription->patient?->surname,
                'items' => $prescription->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'medicine_name' => $item->medicine?->name,
                        'medicine_generic_name' => $item->medicine?->generic_name,
                        'dosage_form' => $item->medicine?->dosage_form,
                        'strength' => $item->medicine?->strength,
                        'quantity' => $item->quantity,
                        'dosage_instructions' => $item->dosage_instructions,
                    ];
                })
            ];
        });

        return response()->json([
            'prescriptions' => $formattedPrescriptions,
            'total' => $prescriptions->count()
        ], 200);
    }

    /**
     * Send prescription to pharmacy (update status to awaiting_dispensary)
     */
    public function sendToPharmacy(Request $request, $id)
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $prescription = Prescription::where('id', $id)
            ->where('patient_id', $patient->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $prescription->update([
            'status' => 'awaiting_dispensary' 
        ]);

        return response()->json([
            'message' => 'Prescription sent to pharmacy successfully',
            'prescription' => $prescription
        ], 200);
    }

    /**
     * Get all pending prescriptions for pharmacy (awaiting_dispensary status)
     */
    public function getPendingDispensary(Request $request)
    {
        // Get prescriptions that have been sent to pharmacy
        $prescriptions = Prescription::whereIn('status', ['pending', 'awaiting_dispensary'])
            ->with([
                'doctor', 
                'patient',
                'appointment',
                'items.medicine'
            ])
            ->orderBy('created_at', 'asc') // First come, first served
            ->get();

        $formattedPrescriptions = $prescriptions->map(function ($prescription) {
            return [
                'id' => $prescription->id,
                'consultation_notes' => $prescription->consultation_notes,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
                'doctor_name' => $prescription->doctor?->name,
                'doctor_surname' => $prescription->doctor?->surname,
                'patient_name' => $prescription->patient?->name,
                'patient_surname' => $prescription->patient?->surname,
                'patient_id' => $prescription->patient_id,
                'items' => $prescription->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'medicine_id' => $item->medicine_id,
                        'medicine_name' => $item->medicine?->name,
                        'medicine_generic_name' => $item->medicine?->generic_name,
                        'dosage_form' => $item->medicine?->dosage_form,
                        'strength' => $item->medicine?->strength,
                        'quantity' => $item->quantity,
                        'dosage_instructions' => $item->dosage_instructions,
                        'available_stock' => $item->medicine?->quantity ?? 0,
                    ];
                })
            ];
        });

        return response()->json([
            'prescriptions' => $formattedPrescriptions,
            'total' => $prescriptions->count()
        ], 200);
    }

    /**
     * Dispense prescription and update medicine stock
     */
    public function dispensePrescription(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $prescription = Prescription::with('items.medicine')->findOrFail($id);

            // Check if prescription is already dispensed
            if ($prescription->status === 'dispensed') {
                return response()->json([
                    'message' => 'This prescription has already been dispensed'
                ], 400);
            }

            // Check stock availability for all items
            $stockIssues = [];
            foreach ($prescription->items as $item) {
                $medicine = $item->medicine;
                if (!$medicine) {
                    $stockIssues[] = "Medicine ID {$item->medicine_id} not found";
                    continue;
                }

                if ($medicine->quantity < $item->quantity) {
                    $stockIssues[] = "{$medicine->name}: Required {$item->quantity}, Available {$medicine->quantity}";
                }
            }

            // If there are stock issues, return error
            if (!empty($stockIssues)) {
                return response()->json([
                    'message' => 'Insufficient stock for some medicines',
                    'stock_issues' => $stockIssues
                ], 400);
            }

            // Deduct stock for each medicine
            foreach ($prescription->items as $item) {
                $medicine = $item->medicine;
                $medicine->decrement('quantity', $item->quantity);
            }

            // Update prescription status to dispensed
            $prescription->update([
                'status' => 'dispensed',
                'dispensed_at' => now(),
                'dispensed_by' => auth()->user()->id ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Prescription dispensed successfully',
                'prescription' => $prescription->load('items.medicine')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to dispense prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search prescriptions in dispensary
     */
    public function searchDispensary(Request $request)
    {
        $searchQuery = $request->input('search', '');

        if (empty($searchQuery)) {
            return $this->getPendingDispensary($request);
        }

        $prescriptions = Prescription::whereIn('status', ['pending', 'awaiting_dispensary'])
            ->with([
                'doctor', 
                'patient',
                'items.medicine'
            ])
            ->where(function ($query) use ($searchQuery) {
                $query->where('id', 'like', "%{$searchQuery}%")
                    ->orWhereHas('patient', function ($q) use ($searchQuery) {
                        $q->where('name', 'like', "%{$searchQuery}%")
                        ->orWhere('surname', 'like', "%{$searchQuery}%");
                    })
                    ->orWhereHas('doctor', function ($q) use ($searchQuery) {
                        $q->where('name', 'like', "%{$searchQuery}%")
                        ->orWhere('surname', 'like', "%{$searchQuery}%");
                    });
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $formattedPrescriptions = $prescriptions->map(function ($prescription) {
            return [
                'id' => $prescription->id,
                'consultation_notes' => $prescription->consultation_notes,
                'status' => $prescription->status,
                'created_at' => $prescription->created_at,
                'doctor_name' => $prescription->doctor?->name,
                'doctor_surname' => $prescription->doctor?->surname,
                'patient_name' => $prescription->patient?->name,
                'patient_surname' => $prescription->patient?->surname,
                'patient_id' => $prescription->patient_id,
                'items' => $prescription->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'medicine_id' => $item->medicine_id,
                        'medicine_name' => $item->medicine?->name,
                        'medicine_generic_name' => $item->medicine?->generic_name,
                        'dosage_form' => $item->medicine?->dosage_form,
                        'strength' => $item->medicine?->strength,
                        'quantity' => $item->quantity,
                        'dosage_instructions' => $item->dosage_instructions,
                        'available_stock' => $item->medicine?->quantity ?? 0,
                    ];
                })
            ];
        });

        return response()->json([
            'prescriptions' => $formattedPrescriptions,
            'total' => $prescriptions->count(),
            'search_query' => $searchQuery
        ], 200);
    }
}
