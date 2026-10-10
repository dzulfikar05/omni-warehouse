<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Supplier extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke transaksi Inbound (Pembelian/Penerimaan Barang)
     */
    public function inbounds(): HasMany
    {
        return $this->hasMany(Transaction::class, 'supplier_id')->where('transaction_type', 'IN');
    }

    /**
     * Relasi ke Item Transaksi untuk mendapatkan produk yang pernah disuplai
     */
    public function supplied_products(): HasManyThrough
    {
        return $this->hasManyThrough(
            TransactionItem::class,
            Transaction::class,
            'supplier_id',       // Foreign key di tabel transactions
            'transaction_id',    // Foreign key di tabel transaction_items
            'id',                // Local key di tabel suppliers
            'id'                 // Local key di tabel transactions
        );
    }
}
