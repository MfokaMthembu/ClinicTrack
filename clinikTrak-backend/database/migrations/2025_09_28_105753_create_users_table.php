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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            $table->string('email')->unique();
            $table->string('password');

            // Status of the account
            $table->enum('status', ['active', 'pending', 'suspended']);

            // Foreign keys
            $table->unsignedBigInteger('patient_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();

            $table->rememberToken();
            $table->timestamps();

            // Constraints
            $table->foreign('patient_id')
                ->references('id')
                ->on('patient_records')
                ->onDelete('cascade');

            $table->foreign('employee_id')
                ->references('id')
                ->on('employees')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
