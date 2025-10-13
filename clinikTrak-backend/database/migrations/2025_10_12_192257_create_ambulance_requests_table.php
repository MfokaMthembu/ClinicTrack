<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ambulance_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('ambulance_id')->nullable();
            $table->unsignedBigInteger('driver_employee_id')->nullable();
            
            // Patient location
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->string('pickup_address')->nullable();
            
            // Destination (hospital) location
            $table->decimal('destination_latitude', 10, 8)->nullable();
            $table->decimal('destination_longitude', 11, 8)->nullable();
            $table->string('destination_address')->nullable();
            
            $table->enum('priority', ['emergency', 'non_emergency'])->default('non_emergency');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            
            $table->enum('status', [
                'pending',
                'assigned',
                'enroute',
                'arrived',
                'transporting',
                'delivered',
                'completed',
                'rejected',
                'cancelled'
            ])->default('pending');
            
            $table->integer('estimated_time_minutes')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('enroute_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('transporting_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patient_records')->onDelete('cascade');
            $table->foreign('ambulance_id')->references('id')->on('ambulances')->onDelete('set null');
            $table->foreign('driver_employee_id')->references('id')->on('employees')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ambulance_requests');
    }
};