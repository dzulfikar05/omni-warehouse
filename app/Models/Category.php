<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'desc',
        'created_by',
        'created_at',
        'updated_at',
    ];

    public function products()
    {
        return $this->hasMany(Products::class);
    }
}