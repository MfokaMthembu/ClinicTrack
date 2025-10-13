<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patient_records')->onDelete('cascade');
            $table->foreignId('doctor_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->json('doctor_types');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'referred', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
