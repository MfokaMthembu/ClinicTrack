<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_employee_id', 
        'preferred_date',
        'preferred_time',
        'doctor_types',
        'reason',
        'status',
    ];

    protected $casts = [
        'doctor_types' => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(Employee::class, 'doctor_employee_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }
}
