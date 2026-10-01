<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Relasi ke item detail transaksi (TransactionItem)
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    /**
     * Relasi ke Operator / Pembuat Transaksi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Supplier
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Relasi ke Customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
