<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class Employee extends Model
{
    use HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'surname',
        'rank',
        'specialization',
        'department_id',
        'phone_number',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function user()
    {
        return $this->hasOne(User::class, 'employee_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_employee_id');
    }

    public function availability()
    {
        return $this->hasMany(DoctorAvailability::class, 'employee_id');
    }
}
