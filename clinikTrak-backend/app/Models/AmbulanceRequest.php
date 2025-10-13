<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'ambulance_id',
        'driver_employee_id',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_address',
        'destination_latitude',
        'destination_longitude',
        'destination_address',
        'priority',
        'reason',
        'notes',
        'status',
        'estimated_time_minutes',
        'distance_km',
        'assigned_at',
        'enroute_at',
        'arrived_at',
        'transporting_at',
        'delivered_at',
        'completed_at',
        'rejected_at',
        'rejection_reason'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'enroute_at' => 'datetime',
        'arrived_at' => 'datetime',
        'transporting_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function ambulance()
    {
        return $this->belongsTo(Ambulance::class);
    }

    public function driver()
    {
        return $this->belongsTo(Employee::class, 'driver_employee_id');
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public static function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    /**
     * Estimate time based on distance and priority
     */
    public static function estimateTime($distanceKm, $priority = 'non_emergency')
    {
        // Average speed: emergency = 60km/h, non-emergency = 40km/h
        $avgSpeed = $priority === 'emergency' ? 60 : 40;
        $timeHours = $distanceKm / $avgSpeed;
        $timeMinutes = ceil($timeHours * 60);
        
        // Add buffer time for traffic, etc.
        $bufferMinutes = $priority === 'emergency' ? 5 : 10;
        
        return $timeMinutes + $bufferMinutes;
    }
}