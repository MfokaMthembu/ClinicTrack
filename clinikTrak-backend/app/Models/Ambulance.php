<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ambulance extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_number',
        'vehicle_model',
        'vehicle_type',
        'driver_employee_id',
        'current_latitude',
        'current_longitude',
        'location_updated_at',
        'status'
    ];

    protected $casts = [
        'location_updated_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Employee::class, 'driver_employee_id');
    }

    public function requests()
    {
        return $this->hasMany(AmbulanceRequest::class);
    }

    public function activeRequest()
    {
        return $this->hasOne(AmbulanceRequest::class)
            ->whereIn('status', ['assigned', 'enroute', 'arrived', 'transporting']);
    }
}