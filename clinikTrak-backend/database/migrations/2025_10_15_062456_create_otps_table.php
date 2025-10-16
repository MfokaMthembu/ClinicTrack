<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('otps', function (Blueprint $table) {
            $table->id();

            // Relationship
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // OTP details
            $table->string('code', 10);
            $table->enum('type', ['password_reset', 'email_verification', '2fa'])
                  ->default('password_reset');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('expires_at');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otps');
    }
};
