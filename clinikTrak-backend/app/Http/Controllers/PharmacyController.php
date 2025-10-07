<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    // Create a new pharmacy
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'location' => 'nullable|string',
            'contact' => 'nullable|string',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        return Pharmacy::create($data);
    }

    // Update pharmacy
    public function update(Request $request, $id)
    {
        $pharmacy = Pharmacy::findOrFail($id);
        $pharmacy->update($request->all());
        return response()->json($pharmacy);
    }

    // Get all pharmacies
    public function index()
    {
        return Pharmacy::with('prescriptions')->get();
    }

    // Delete pharmacy
    public function destroy($id)
    {
        Pharmacy::destroy($id);
        return response()->json(['message' => 'Pharmacy deleted successfully']);
    }

    // Dispense medication
    public function dispense($prescriptionId)
    {
        $prescription = Prescription::findOrFail($prescriptionId);
        $pharmacy = $prescription->pharmacy;

        try {
            $pharmacy->dispenseMedicine($prescription);
            return response()->json(['message' => 'Medication dispensed successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
