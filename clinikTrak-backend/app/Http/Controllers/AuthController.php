<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Employee;
use App\Models\Patient;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        // Determine dashboard based on role
        if ($user->hasRole('admin')) {
            $dashboard = '/admin';
        } elseif ($user->hasRole('doctor')) {
            $dashboard = '/doctor';
        } elseif ($user->hasRole('patient')) {
            $dashboard = '/patient';
        } elseif ($user->hasRole('pharmacist')) {
            $dashboard = '/pharmacist';
        } elseif ($user->hasRole('ambulance-driver')) {
            $dashboard = '/ambulance';
        } else {
            $dashboard = '/';
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'dashboard' => $dashboard,
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }


    /**
     * Determine registration form based on role.
     */
    public function register(Request $request)
    {
        $request->validate([
            'role' => 'required|string|max:255',
        ]);

        $role = strtolower($request->input('role'));
        $registrationForm = '/';

        if ($role === 'patient') {
            $registrationForm = '/patient-register';
        } elseif ($role === 'staff') {
            $registrationForm = '/staff-register';
        }

        return response()->json([
            'redirect' => $registrationForm,
        ], 201);
    }

   
    /**
     * Register a new patient along with their user account.
     */
    public function registerPatient(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'surname'   => 'required|string|max:255',
            'dob'       => 'required|date',
            'gender'    => 'required|in:Male,Female',
            'address'   => 'required|string',
            'medical_history' => 'nullable|string',
            'attachment'      => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
            'email'     => 'required|string|email|unique:users,email',
            'password'  => 'required|string|min:8',
        ]);

        // 1. Handle file upload if present
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('attachments/patients', 'public');
        }

        // 2. Create patient record
        $patient = Patient::create([
            'name'            => $validated['name'],
            'surname'         => $validated['surname'],
            'dob'             => $validated['dob'],
            'gender'          => $validated['gender'],
            'address'         => $validated['address'],
            'medical_history' => $validated['medical_history'] ?? null,
            'attachment_path' => $attachmentPath,
        ]);

        // 3. Create linked user
        $user = User::create([
            'email'       => $validated['email'],
            'password'    => Hash::make($validated['password']),
            'status'      => 'active',  // Patients always active
            'patient_id'  => $patient->id,
        ]);

        // 4. Attach Patient role
        $user->assignRole('patient');

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Patient registered successfully',
            'patient' => $patient,
            'user'    => $user,
            'token'   => $token,  
        ], 201);
    }

    /**
     *  Staff registration (doctors, pharmacists, ambulance drivers)
     */
    public function registerStaff(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'surname'    => 'required|string|max:255',
            'rank'       => 'required|in:Private,Lance Corporal,Sergeant,Major,Captain,Lieutenant,Colonel',
            'specialization' => 'required|in:Surgeon,Cardiology,Dentist,General Medicine,Orthopedic,Optician,Gynaecology,Pharmacist,Ambulance Driver',
            'department' => 'required|string|max:255', // will need mapping to department_id
            'phone'      => 'required|string|max:20',
            'email'      => 'required|string|email|unique:users,email',
            'password'   => 'required|string|min:8',
        ]);

        // Mapping department string to department_id
        $departmentId = \DB::table('departments')
            ->where('name', $validated['department'])
            ->value('id');

        if (!$departmentId) {
            return response()->json([
                'message' => 'Invalid department selected',
            ], 422);
        }

        // Create employee record
        $employee = Employee::create([
            'name'          => $validated['name'],
            'surname'       => $validated['surname'],
            'rank'          => $validated['rank'],
            'specialization' => $validated['specialization'],
            'department_id' => $departmentId,
            'phone_number'  => $validated['phone'],
        ]);

        // Create linked user (pending by default until approval)
        $user = User::create([
            'email'       => $validated['email'],
            'password'    => Hash::make($validated['password']),
            'status'      => 'pending',
            'employee_id' => $employee->id,
        ]);

        //  Create token as well
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message'  => 'Staff registered successfully. Awaiting admin approval.',
            'employee' => $employee,
            'user'     => $user,
            'token'    => $token, 
        ], 201);
    }

    /**
     * Get authenticated user details
     */
    public function getUserDetails(Request $request)
    {
        $user = $request->user()->load(['patient', 'employee', 'roles']);

        return response()->json([
            'user' => $user
        ]);
    }


}