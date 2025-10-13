<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ambulances', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number')->unique();
            $table->string('vehicle_model')->nullable();
            $table->enum('vehicle_type', ['basic', 'advanced', 'air'])->default('basic');
            $table->unsignedBigInteger('driver_employee_id')->nullable();
            $table->decimal('current_latitude', 10, 8)->nullable();
            $table->decimal('current_longitude', 11, 8)->nullable();
            $table->timestamp('location_updated_at')->nullable();
            $table->enum('status', ['available', 'on_duty', 'maintenance', 'offline'])->default('available');
            $table->timestamps();

            $table->foreign('driver_employee_id')->references('id')->on('employees')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ambulances');
    }
};