<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('transaction_type')->constrained()->nullOnDelete();
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->timestamp('counted_at')->nullable()->after('good_qty');
            $table->text('count_notes')->nullable()->after('counted_at');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn(['counted_at', 'count_notes']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('warehouse_id');
        });
    }
};
