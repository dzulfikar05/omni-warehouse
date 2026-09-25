<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products'; // Sesuaikan jika nama tabel berbeda

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'created_by',
    ];
}