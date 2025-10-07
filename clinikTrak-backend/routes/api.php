<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Spatie\Permission\Middleware\RoleMiddleware;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-patient', [AuthController::class, 'registerPatient']);
Route::post('/register-staff', [AuthController::class, 'registerStaff']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin-only routes
    Route::middleware([RoleMiddleware::class . ':admin'])->group(function () {
        // User Management 
        Route::get('/users', [UserController::class, 'getUsers']); // fetch all

        // Actions
        Route::patch('/users/{id}/approve', [UserController::class, 'approveUser']);
        Route::patch('/users/{id}/disapprove', [UserController::class, 'disapproveUser']);
        Route::patch('/users/{id}', [UserController::class, 'updateUser']); // update details
        Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

        // Search / Filter / Sort
        Route::get('/users/search', [UserController::class, 'searchUsers']);
        Route::get('/users/filter', [UserController::class, 'filterUsers']);
        Route::get('/users/sort', [UserController::class, 'sortUsers']);
    });
});
