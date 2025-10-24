<?php

namespace App\Http\Controllers;

use App\Models\Ambulance;
use App\Models\AmbulanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\AmbulanceLocationUpdated;

class AmbulanceController extends Controller
{
    /**
     * Get all available ambulances with their locations
     */
    public function getAvailableAmbulances()
    {
        $ambulances = Ambulance::with('driver')
            ->where('status', 'available')
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->get()
            ->map(function ($ambulance) {
                return [
                    'id' => $ambulance->id,
                    'registration_number' => $ambulance->registration_number,
                    'vehicle_model' => $ambulance->vehicle_model,
                    'vehicle_type' => $ambulance->vehicle_type,
                    'driver_name' => $ambulance->driver ? $ambulance->driver->name : 'N/A',
                    'current_latitude' => $ambulance->current_latitude,
                    'current_longitude' => $ambulance->current_longitude,
                    'location_updated_at' => $ambulance->location_updated_at,
                    'status' => $ambulance->status
                ];
            });

        return response()->json([
            'ambulances' => $ambulances,
            'total' => $ambulances->count()
        ]);
    }

    /**
     * Patient: Create ambulance request
     */
    public function createRequest(Request $request)
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $validated = $request->validate([
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'pickup_address' => 'nullable|string|max:500',
            'destination_latitude' => 'nullable|numeric|between:-90,90',
            'destination_longitude' => 'nullable|numeric|between:-180,180',
            'destination_address' => 'nullable|string|max:500',
            'priority' => 'required|in:emergency,non_emergency',
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $ambulanceRequest = AmbulanceRequest::create([
            'patient_id' => $patient->id,
            'pickup_latitude' => $validated['pickup_latitude'],
            'pickup_longitude' => $validated['pickup_longitude'],
            'pickup_address' => $validated['pickup_address'] ?? null,
            'destination_latitude' => $validated['destination_latitude'] ?? null,
            'destination_longitude' => $validated['destination_longitude'] ?? null,
            'destination_address' => $validated['destination_address'] ?? null,
            'priority' => $validated['priority'],
            'reason' => $validated['reason'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Ambulance request created successfully',
            'request' => $ambulanceRequest->load('patient')
        ], 201);
    }

    /**
     * Get patient's ambulance requests
     */
    public function getPatientRequests()
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json(['message' => 'Patient profile not found'], 404);
        }

        $requests = AmbulanceRequest::where('patient_id', $patient->id)
            ->with(['ambulance', 'driver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'status' => $req->status,
                    'priority' => $req->priority,
                    'reason' => $req->reason,
                    'pickup_address' => $req->pickup_address,
                    'pickup_latitude' => $req->pickup_latitude,
                    'pickup_longitude' => $req->pickup_longitude,
                    'destination_address' => $req->destination_address,
                    'ambulance_registration' => $req->ambulance?->registration_number,
                    'ambulance_latitude' => $req->ambulance?->current_latitude,
                    'ambulance_longitude' => $req->ambulance?->current_longitude,
                    'ambulance_location_updated' => $req->ambulance?->location_updated_at,
                    'driver_name' => $req->driver ? $req->driver->name : null,
                    'estimated_time_minutes' => $req->estimated_time_minutes,
                    'distance_km' => $req->distance_km,
                    'created_at' => $req->created_at,
                    'assigned_at' => $req->assigned_at,
                    'enroute_at' => $req->enroute_at,
                    'arrived_at' => $req->arrived_at,
                ];
            });

        return response()->json([
            'requests' => $requests,
            'total' => $requests->count()
        ]);
    }

    /**
     * Driver: Get pending requests
     */
    public function getPendingRequests()
    {
        $requests = AmbulanceRequest::with(['patient'])
            ->where('status', 'pending')
            ->orderByRaw("FIELD(priority, 'emergency', 'non_emergency')")
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'patient_name' => $req->patient?->name,
                    'patient_surname' => $req->patient?->surname,
                    'patient_id' => $req->patient_id,
                    'pickup_latitude' => $req->pickup_latitude,
                    'pickup_longitude' => $req->pickup_longitude,
                    'pickup_address' => $req->pickup_address,
                    'destination_latitude' => $req->destination_latitude,
                    'destination_longitude' => $req->destination_longitude,
                    'destination_address' => $req->destination_address,
                    'priority' => $req->priority,
                    'reason' => $req->reason,
                    'notes' => $req->notes,
                    'created_at' => $req->created_at,
                ];
            });

        return response()->json([
            'requests' => $requests,
            'total' => $requests->count()
        ]);
    }

    /**
     * Driver: Approve request and calculate ETA
     */
    public function approveRequest(Request $request, $id)
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $validated = $request->validate([
            'ambulance_id' => 'required|exists:ambulances,id',
            'current_latitude' => 'required|numeric|between:-90,90',
            'current_longitude' => 'required|numeric|between:-180,180',
        ]);

        try {
            DB::beginTransaction();

            $ambulanceRequest = AmbulanceRequest::findOrFail($id);

            if ($ambulanceRequest->status !== 'pending') {
                return response()->json(['message' => 'Request has already been processed'], 400);
            }

            $ambulance = Ambulance::findOrFail($validated['ambulance_id']);

            // Check if ambulance is available
            if ($ambulance->status !== 'available') {
                return response()->json(['message' => 'Ambulance is not available'], 400);
            }

            // Calculate distance and ETA
            $distance = AmbulanceRequest::calculateDistance(
                $validated['current_latitude'],
                $validated['current_longitude'],
                $ambulanceRequest->pickup_latitude,
                $ambulanceRequest->pickup_longitude
            );

            $estimatedTime = AmbulanceRequest::estimateTime($distance, $ambulanceRequest->priority);

            // Update request
            $ambulanceRequest->update([
                'ambulance_id' => $ambulance->id,
                'driver_employee_id' => $driver->id,
                'status' => 'assigned',
                'distance_km' => $distance,
                'estimated_time_minutes' => $estimatedTime,
                'assigned_at' => now()
            ]);

            // Update ambulance status and location
            $ambulance->update([
                'driver_employee_id' => $driver->id,
                'current_latitude' => $validated['current_latitude'],
                'current_longitude' => $validated['current_longitude'],
                'location_updated_at' => now(),
                'status' => 'on_duty'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Request approved successfully',
                'request' => $ambulanceRequest->load(['patient', 'ambulance', 'driver']),
                'eta_minutes' => $estimatedTime,
                'distance_km' => $distance
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to approve request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Driver: Reject request
     */
    public function rejectRequest(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        $ambulanceRequest = AmbulanceRequest::findOrFail($id);

        if ($ambulanceRequest->status !== 'pending') {
            return response()->json(['message' => 'Request has already been processed'], 400);
        }

        $ambulanceRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'rejected_at' => now()
        ]);

        return response()->json([
            'message' => 'Request rejected',
            'request' => $ambulanceRequest
        ]);
    }

    /**
     * Driver: Update request status
     */
    public function updateRequestStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:enroute,arrived,transporting,delivered,completed',
            'current_latitude' => 'nullable|numeric|between:-90,90',
            'current_longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            DB::beginTransaction();

            $ambulanceRequest = AmbulanceRequest::with('ambulance')->findOrFail($id);

            $statusField = $validated['status'] . '_at';
            $updateData = [
                'status' => $validated['status'],
                $statusField => now()
            ];

            $ambulanceRequest->update($updateData);

            // Update ambulance location if provided
            if (isset($validated['current_latitude']) && isset($validated['current_longitude'])) {
                $ambulanceRequest->ambulance->update([
                    'current_latitude' => $validated['current_latitude'],
                    'current_longitude' => $validated['current_longitude'],
                    'location_updated_at' => now()
                ]);

                // Broadcast location update
                broadcast(new AmbulanceLocationUpdated($ambulanceRequest->ambulance->fresh(['driver'])))->toOthers();
            }

            // If completed, set ambulance back to available
            if ($validated['status'] === 'completed') {
                $ambulanceRequest->ambulance->update([
                    'status' => 'available'
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Status updated successfully',
                'request' => $ambulanceRequest->fresh()->load(['patient', 'ambulance', 'driver'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active request for driver
     */
    public function getActiveRequest()
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $request = AmbulanceRequest::with(['patient', 'ambulance'])
            ->where('driver_employee_id', $driver->id)
            ->whereIn('status', ['assigned', 'enroute', 'arrived', 'transporting'])
            ->first();

        if (!$request) {
            return response()->json([
                'request' => null,
                'message' => 'No active request'
            ]);
        }

        return response()->json([
            'request' => [
                'id' => $request->id,
                'patient_name' => $request->patient?->name,
                'patient_surname' => $request->patient?->surname,
                'pickup_latitude' => $request->pickup_latitude,
                'pickup_longitude' => $request->pickup_longitude,
                'pickup_address' => $request->pickup_address,
                'destination_latitude' => $request->destination_latitude,
                'destination_longitude' => $request->destination_longitude,
                'destination_address' => $request->destination_address,
                'priority' => $request->priority,
                'status' => $request->status,
                'estimated_time_minutes' => $request->estimated_time_minutes,
                'distance_km' => $request->distance_km,
                'assigned_at' => $request->assigned_at,
            ]
        ]);
    }

    /**
     * Driver: Get their ambulance
     */
    public function getDriverAmbulance()
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $ambulance = Ambulance::where('driver_employee_id', $driver->id)->first();

        if (!$ambulance) {
            return response()->json([
                'ambulance' => null,
                'message' => 'No ambulance registered'
            ]);
        }

        return response()->json([
            'ambulance' => [
                'id' => $ambulance->id,
                'registration_number' => $ambulance->registration_number,
                'vehicle_model' => $ambulance->vehicle_model,
                'vehicle_type' => $ambulance->vehicle_type,
                'current_latitude' => $ambulance->current_latitude,
                'current_longitude' => $ambulance->current_longitude,
                'location_updated_at' => $ambulance->location_updated_at,
                'status' => $ambulance->status
            ]
        ]);
    }

    /**
     * Driver: Register/Add their ambulance
     */
    public function registerAmbulance(Request $request)
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $validated = $request->validate([
            'registration_number' => 'required|string|max:255|unique:ambulances,registration_number',
            'vehicle_model' => 'nullable|string|max:255',
            'vehicle_type' => 'required|in:basic,advanced,air',
        ]);

        // Check if driver already has an ambulance
        $existingAmbulance = Ambulance::where('driver_employee_id', $driver->id)->first();
        
        if ($existingAmbulance) {
            return response()->json([
                'message' => 'You already have a registered ambulance'
            ], 400);
        }

        $ambulance = Ambulance::create([
            'registration_number' => $validated['registration_number'],
            'vehicle_model' => $validated['vehicle_model'] ?? null,
            'vehicle_type' => $validated['vehicle_type'],
            'driver_employee_id' => $driver->id,
            'status' => 'offline'
        ]);

        return response()->json([
            'message' => 'Ambulance registered successfully',
            'ambulance' => $ambulance
        ], 201);
    }

    /**
     * Driver: Update their ambulance details
     */
    public function updateAmbulance(Request $request, $id)
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $ambulance = Ambulance::where('id', $id)
            ->where('driver_employee_id', $driver->id)
            ->firstOrFail();

        $validated = $request->validate([
            'registration_number' => 'sometimes|required|string|max:255|unique:ambulances,registration_number,' . $id,
            'vehicle_model' => 'nullable|string|max:255',
            'vehicle_type' => 'sometimes|required|in:basic,advanced,air',
        ]);

        $ambulance->update($validated);

        return response()->json([
            'message' => 'Ambulance updated successfully',
            'ambulance' => $ambulance
        ]);
    }

    /**
    * Driver: Update ambulance location (with real-time broadcasting)
    */
    public function updateLocation(Request $request)
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $ambulance = Ambulance::where('driver_employee_id', $driver->id)->first();

        if (!$ambulance) {
            return response()->json(['message' => 'No ambulance registered'], 404);
        }

        $ambulance->update([
            'current_latitude' => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
            'location_updated_at' => now()
        ]);

        // Broadcast the location update in real-time
        broadcast(new AmbulanceLocationUpdated($ambulance->fresh(['driver'])))->toOthers();

        return response()->json([
            'message' => 'Location updated successfully',
            'ambulance' => $ambulance
        ]);
    }

    /**
     * Driver: Toggle ambulance availability status
     */
    public function toggleStatus(Request $request)
    {
        $driver = auth()->user()->employee;

        if (!$driver) {
            return response()->json(['message' => 'Driver profile not found'], 404);
        }

        $ambulance = Ambulance::where('driver_employee_id', $driver->id)->first();

        if (!$ambulance) {
            return response()->json(['message' => 'No ambulance registered'], 404);
        }

        // Don't allow status change if on duty
        if ($ambulance->status === 'on_duty') {
            return response()->json([
                'message' => 'Cannot change status while on duty'
            ], 400);
        }

        $newStatus = $ambulance->status === 'available' ? 'offline' : 'available';

        $ambulance->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status updated to ' . $newStatus,
            'ambulance' => $ambulance
        ]);
    }

    /**
     * Patient: Get all ambulances with their current locations (for tracking)
     */
    public function getAllAmbulancesWithLocation()
    {
        $ambulances = Ambulance::with('driver')
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->get()
            ->map(function ($ambulance) {
                return [
                    'id' => $ambulance->id,
                    'registration_number' => $ambulance->registration_number,
                    'vehicle_model' => $ambulance->vehicle_model,
                    'vehicle_type' => $ambulance->vehicle_type,
                    'driver_name' => $ambulance->driver ? $ambulance->driver->name : 'N/A',
                    'current_latitude' => $ambulance->current_latitude,
                    'current_longitude' => $ambulance->current_longitude,
                    'location_updated_at' => $ambulance->location_updated_at,
                    'status' => $ambulance->status
                ];
            });

        return response()->json([
            'ambulances' => $ambulances,
            'total' => $ambulances->count()
        ]);
    }
}