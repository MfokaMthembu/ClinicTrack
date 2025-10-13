<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DoctorAvailabilityController;
use App\Http\Controllers\AmbulanceController;
use Spatie\Permission\Middleware\RoleMiddleware;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-patient', [AuthController::class, 'registerPatient']);
Route::post('/register-staff', [AuthController::class, 'registerStaff']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/current', [UserController::class, 'getCurrentUser']);
    Route::get('/medicines/available', [PharmacyController::class, 'availableMedicines']);
    Route::get('/ambulances/available', [AmbulanceController::class, 'getAvailableAmbulances']);
    Route::get('/ambulances/available', [AmbulanceController::class, 'getAvailableAmbulances']);
    Route::get('/ambulances/all-locations', [AmbulanceController::class, 'getAllAmbulancesWithLocation']);

    // Admin-only routes
    Route::middleware([RoleMiddleware::class . ':admin'])->group(function () {
        // User Management 
        Route::get('/users', [UserController::class, 'getUsers']); // fetch all

        // Actions
        Route::patch('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::patch('/users/{id}/disapprove', [UserController::class, 'disapproveUser']);
        Route::patch('/users/{id}/update-user', [UserController::class, 'updateUser']); 
        Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
        Route::get('/users/{id}/details', [UserController::class, 'showDetails']);
        Route::put('/users/update-user/{id}', [UserController::class, 'updateUser']);


        // Search / Filter / Sort
        Route::get('/users/search', [UserController::class, 'searchUsers']);
        Route::get('/users/filter', [UserController::class, 'filterUsers']);
        Route::get('/users/sort', [UserController::class, 'sortUsers']);
    });

    // Patient-only routes
    Route::middleware([RoleMiddleware::class . ':patient'])->group(function () {
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::get('/get-appointments', [AppointmentController::class, 'getPatientAppointments']);
        Route::get('/appointments/pending', [AppointmentController::class, 'getPendingPatientAppointments']);
        Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancelAppointment']);

        // get available doctors
        Route::get('/doctors/available', [DoctorAvailabilityController::class, 'getAvailableDoctors']);
        Route::get('/doctors/by-specialization', [DoctorAvailabilityController::class, 'getDoctorsBySpecialization']);
        Route::get('/doctors/{id}/dr-availability', [DoctorAvailabilityController::class, 'getPublicDoctorAvailability']);
    
        // Patient prescription routes
        Route::get('/patient/prescriptions', [PrescriptionController::class, 'getPatientPrescriptions']);
        Route::post('/patient/prescriptions/{id}/send-to-pharmacy', [PrescriptionController::class, 'sendToPharmacy']);

        // ambulance request routes
        Route::post('/ambulance-requests', [AmbulanceController::class, 'createRequest']);
        Route::get('/patient/ambulance-requests', [AmbulanceController::class, 'getPatientRequests']);
    
    });

    // Doctor-only routes
    Route::middleware([RoleMiddleware::class . ':doctor'])->group(function () {
        Route::get('/appointments/pending', [AppointmentController::class, 'getPendingAppointments']);
        Route::post('/appointments/{id}/accept', [AppointmentController::class, 'acceptAppointment']);
        Route::patch('/appointments/{id}/reject', [AppointmentController::class, 'rejectAppointment']);
        Route::get('/doctor/appointments', [AppointmentController::class, 'doctorAppointments']);
        Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

        // Availability management
        Route::get('/doctor/get-availability', [DoctorAvailabilityController::class, 'getDoctorAvailability']);
        Route::post('/doctor/availability', [DoctorAvailabilityController::class, 'storeDoctorAvailability']);
        Route::delete('/doctor/availability/{id}', [DoctorAvailabilityController::class, 'deleteDoctorAvailability']);

        // Prescription Routes
        Route::get('/doctor/approved-appointments', [PrescriptionController::class, 'getDoctorApprovedAppointments']);
        Route::get('/doctor/search-approved-appointments', [PrescriptionController::class, 'searchDoctorApprovedAppointments']);
         Route::post('/prescriptions', [PrescriptionController::class, 'store']);
        Route::get('/doctor/medicines', [PharmacyController::class, 'index']);
    });

    // Pharmacy-only routes
    Route::middleware([RoleMiddleware::class . ':pharmacist'])->group(function () {
        // Pharmacy CRUD

        Route::get('/medicines/search', [PharmacyController::class, 'search']);
        Route::get('/medicines', [PharmacyController::class, 'index']);
        Route::get('/medicines/{id}', [PharmacyController::class, 'show']);
        Route::post('/medicines', [PharmacyController::class, 'store']);
        Route::put('/medicines/{id}', [PharmacyController::class, 'update']);
        Route::delete('/medicines/{id}', [PharmacyController::class, 'destroy']);

        // Prescriptions Routes
        Route::get('/pharmacy/prescriptions', [PrescriptionController::class, 'getPendingDispensary']);
        Route::get('/pharmacy/prescriptions/search', [PrescriptionController::class, 'searchDispensary']);
        Route::post('/pharmacy/prescriptions/{id}/dispense', [PrescriptionController::class, 'dispensePrescription']);

    });

    // Ambulance Driver-only routes
    Route::middleware([RoleMiddleware::class . ':ambulance-driver'])->group(function () {
        // Driver ambulance management routes
        Route::get('/driver/ambulance', [AmbulanceController::class, 'getDriverAmbulance']);
        Route::post('/driver/ambulance/register', [AmbulanceController::class, 'registerAmbulance']);
        Route::put('/driver/ambulance/{id}', [AmbulanceController::class, 'updateAmbulance']);
        Route::post('/driver/ambulance/update-location', [AmbulanceController::class, 'updateLocation']);
        Route::post('/driver/ambulance/toggle-status', [AmbulanceController::class, 'toggleStatus']);

        // Requests management routes
        Route::get('/driver/ambulance-requests/pending', [AmbulanceController::class, 'getPendingRequests']);
        Route::get('/driver/ambulance-requests/active', [AmbulanceController::class, 'getActiveRequest']);
        Route::post('/driver/ambulance-requests/{id}/approve', [AmbulanceController::class, 'approveRequest']);
        Route::post('/driver/ambulance-requests/{id}/reject', [AmbulanceController::class, 'rejectRequest']);
        Route::put('/driver/ambulance-requests/{id}/status', [AmbulanceController::class, 'updateRequestStatus']);
    });

});
