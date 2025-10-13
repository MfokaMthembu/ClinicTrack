<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    /**
     * Get all medicines
     */
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();

        return response()->json([
            'medicines' => $medicines,
            'total' => $medicines->count()
        ]);
    }

    /**
     * Get medicines for prescription (only in stock)
     */
    public function availableMedicines()
    {
        $medicines = Medicine::select('id', 'name', 'dosage_form', 'strength', 'quantity')
            ->where('quantity', '>', 0)
            ->orderBy('name')
            ->get();

        return response()->json([
            'medicines' => $medicines
        ]);
    }

    /**
     * Get single medicine by ID
     */
    public function show($id)
    {
        $medicine = Medicine::findOrFail($id);
        
        return response()->json([
            'medicine' => $medicine
        ]);
    }

    /**
     * Store medicine in inventory
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'category' => 'required|in:Analgesics,Antibiotics,Antidepressents,Antifungals,Hormones,Diuretics',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        $medicine = Medicine::create($data);
        
        return response()->json([
            'message' => 'Medicine added successfully',
            'medicine' => $medicine
        ], 201);
    }

    /**
     * Update medicine in inventory
     */
    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'category' => 'sometimes|required|in:Analgesics,Antibiotics,Antidepressents,Antifungals,Hormones,Diuretics',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:100',
            'quantity' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        $medicine->update($data);
        
        return response()->json([
            'message' => 'Medicine updated successfully',
            'medicine' => $medicine
        ]);
    }

    /**
     * Delete medicine from inventory
     */
    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();
        
        return response()->json([
            'message' => 'Medicine deleted successfully'
        ]);
    }

    /**
     * Search medicines
     */
    public function search(Request $request)
    {
        $query = $request->input('search', '');

        $medicines = Medicine::where('name', 'like', "%{$query}%")
            ->orWhere('generic_name', 'like', "%{$query}%")
            ->orWhere('category', 'like', "%{$query}%")
            ->orderBy('name')
            ->get();

        return response()->json([
            'medicines' => $medicines,
            'total' => $medicines->count()
        ]);
    }
}