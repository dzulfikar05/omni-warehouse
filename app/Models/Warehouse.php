<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'desc',
        'is_active',
        'created_by',
    ];

    /**
     * Relasi ke lokasi / rak yang ada di dalam gudang ini.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'warehouse_id');
    }
}
