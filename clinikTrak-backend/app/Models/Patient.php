<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;
    
    protected $table = 'patient_records';

    protected $fillable = [
        'name',
        'surname',
        'dob',
        'gender',
        'address',
        'medical_history',
        'attachment_path',
    ];

    /**
     * Relationship: A patient has one user account.
     */
    public function user()
    {
        return $this->hasOne(User::class, 'patient_id');
    }
}
