<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorAvailability extends Model
{
    use HasFactory;
    protected $table = 'doctor_availability'; 
    
    protected $fillable = [
        'employee_id',
        'date',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'is_active' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

}