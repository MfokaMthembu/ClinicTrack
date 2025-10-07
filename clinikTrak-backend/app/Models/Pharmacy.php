<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'location', 'contact', 'stock_quantity'];

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Dispense medicine and auto-decrement stock
     */
    public function dispenseMedicine(Prescription $prescription)
    {
        if ($this->stock_quantity >= $prescription->quantity) {
            $this->decrement('stock_quantity', $prescription->quantity);
            $prescription->update(['status' => 'dispensed']);
        } else {
            throw new \Exception("Not enough stock to dispense this prescription.");
        }
    }
}
