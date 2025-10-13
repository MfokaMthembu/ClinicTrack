<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'generic_name', 'category', 'dosage_form',
        'strength', 'quantity', 'price', 'expiry_date'
    ];

    public function prescriptionItems()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
