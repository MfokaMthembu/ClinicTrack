<?php

namespace App\Events;

use App\Models\Ambulance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AmbulanceLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ambulance;

    public function __construct(Ambulance $ambulance)
    {
        $this->ambulance = $ambulance;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return [
            new Channel('ambulance.' . $this->ambulance->id),
            new Channel('ambulances'), // Global channel for all ambulances
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'location.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'ambulance_id' => $this->ambulance->id,
            'registration_number' => $this->ambulance->registration_number,
            'latitude' => $this->ambulance->current_latitude,
            'longitude' => $this->ambulance->current_longitude,
            'status' => $this->ambulance->status,
            'location_updated_at' => $this->ambulance->location_updated_at?->toIso8601String(),
            'driver_name' => $this->ambulance->driver?->name,
        ];
    }
}