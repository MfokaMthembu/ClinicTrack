<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'doctor_employee_id',
        'patient_id',
        'consultation_notes',
        'status',
    ];

    public function doctor()
    {
        return $this->belongsTo(Employee::class, 'doctor_employee_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
