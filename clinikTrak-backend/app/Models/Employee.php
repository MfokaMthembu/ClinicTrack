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
        'department_id',
        'phone_number',
    ];

    /**
     * An employee belongs to a department.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * An employee has one linked user account.
     */
    public function user()
    {
        return $this->hasOne(User::class, 'employee_id');
    }

    /**
     * A user can only be linked to one patient profile.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * A user can only be linked to one employee profile.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

}
