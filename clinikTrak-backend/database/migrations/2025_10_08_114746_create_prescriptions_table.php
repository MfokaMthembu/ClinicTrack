<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('doctor_employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patient_records')->onDelete('cascade');
            $table->text('consultation_notes')->nullable();
            $table->enum('status', ['pending', 'awaiting dispensary', 'dispensed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
