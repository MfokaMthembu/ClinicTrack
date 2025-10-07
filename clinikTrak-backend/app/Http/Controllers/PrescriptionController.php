<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    // Create a prescription
    public function store(Request $request)
    {
        $data = $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:users,id',
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'medication_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'consultation_notes' => 'nullable|string',
        ]);

        return Prescription::create($data);
    }

    // Get all prescriptions
    public function index()
    {
        return Prescription::with(['doctor', 'patient', 'pharmacy'])->get();
    }

    // Update prescription
    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $prescription->update($request->all());
        return response()->json($prescription);
    }

    // Delete prescription
    public function destroy($id)
    {
        Prescription::destroy($id);
        return response()->json(['message' => 'Prescription deleted']);
    }
}
