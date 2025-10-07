<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class Department extends Model
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'description',
    ];

    // Relationships

    /**
     * A department can have many employees.
     */
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
