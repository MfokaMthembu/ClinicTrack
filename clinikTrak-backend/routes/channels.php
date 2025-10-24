<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public channel for ambulance locations (anyone can listen)
Broadcast::channel('ambulances', function ($user) {
    return true;
});

// Private channel for specific ambulance (only authorized users)
Broadcast::channel('ambulance.{ambulanceId}', function ($user, $ambulanceId) {
    return true; // Adjust authorization as needed
});