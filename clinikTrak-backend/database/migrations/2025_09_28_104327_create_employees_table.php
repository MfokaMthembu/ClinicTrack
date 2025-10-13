<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('surname');
            $table->enum('rank', [
                'Private', 'Lance Corporal', 'Sergeant',
                'Major', 'Captain', 'Lieutenant', 'Colonel'
            ]);
            $table->enum('specialization', [
                'Surgeon', 'Cardiology', 'Dentist',
                'General Medicine', 'Orthopedic', 'Optician', 'Gynaecology', 'Pharmacist', 'Ambulance Driver'
            ])->nullable();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('phone_number');
            $table->timestamps();
        });

    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
