<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;
use App\Models\User;
use App\Models\Otp;

class ForgotPasswordController extends Controller
{
    /**
     * Verify Email & Send OTP
     */
    public function verifyEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found.'
            ], 404);
        }

        // Delete old unverified OTPs
        $user->otps()->where('is_verified', false)->delete();

        // Generate OTP code
        $otpCode = Otp::generateCode();

        // Create OTP record
        $otp = $user->otps()->create([
            'code' => $otpCode,
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes(10),
        ]);

        // Send styled OTP email via SMTP
        Mail::send([], [], function ($message) use ($user, $otpCode) {
            $message->to($user->email)
                    ->subject('Password Reset OTP')
                    ->setBody("
                        <html>
                            <body style='font-family: Arial, sans-serif; color:#222;'>
                                <div style='max-width:500px; margin:auto; background:#f9f9f9; border-radius:8px; padding:20px;'>
                                    <div style='text-align:center;'>
                                        <h2 style='color:#004e1f;'>MMH's Password Reset</h2>
                                        <p>Use the code below to reset your password:</p>
                                        <h1 style='letter-spacing:4px; background:#004e1f; color:white; padding:10px 20px; display:inline-block; border-radius:6px;'>$otpCode</h1>
                                        <p>This code expires in 10 minutes.</p>
                                        <p>If you did not request this password reset, please ignore this email.</p>
                                        <br/>
                                        <small>— KaShaba Tech Support</small>
                                    </div>
                                </div>
                            </body>
                        </html>
                    ", 'text/html'); 
        });

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully to your email.'
        ]);
    }

    /**
     *  Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $otpRecord = Otp::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('type', 'password_reset')
            ->latest()
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.'
            ], 400);
        }

        if ($otpRecord->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired. Please request a new one.'
            ], 400);
        }

        $otpRecord->update(['is_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully.'
        ]);
    }

    /**
     *  Reset Password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $otpVerified = Otp::where('user_id', $user->id)
            ->where('type', 'password_reset')
            ->where('is_verified', true)
            ->where('expires_at', '>', Carbon::now())
            ->exists();

        if (!$otpVerified) {
            return response()->json([
                'success' => false,
                'message' => 'OTP not verified or expired.'
            ], 403);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Clean up OTPs for this user
        Otp::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.'
        ]);
    }

    
}
