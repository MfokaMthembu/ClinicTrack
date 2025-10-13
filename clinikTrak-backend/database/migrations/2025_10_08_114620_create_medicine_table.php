<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('category')->nullable(); // e.g. antibiotic, analgesic
            $table->string('dosage_form')->nullable(); // e.g. tablet, syrup
            $table->string('strength')->nullable(); // e.g. 500mg
            $table->integer('quantity')->default(0); // stock count
            $table->decimal('price', 10, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
