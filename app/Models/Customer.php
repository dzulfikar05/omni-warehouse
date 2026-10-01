<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'phone',
        'email',
        'notes',
        'created_by',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke transaksi Outbound (Penjualan/Pengeluaran Barang)
     */
    public function outbounds(): HasMany
    {
        return $this->hasMany(Transaction::class, 'customer_id')->where('transaction_type', 'OUT');
    }

    /**
     * Relasi ke Item Transaksi untuk mendapatkan produk yang dibeli customer
     */
    public function purchased_products(): HasManyThrough
    {
        return $this->hasManyThrough(
            TransactionItem::class,
            Transaction::class,
            'customer_id',      // Foreign key di tabel transactions
            'transaction_id',   // Foreign key di tabel transaction_items
            'id',               // Local key di tabel customers
            'id'                // Local key di tabel transactions
        );
    }
}
