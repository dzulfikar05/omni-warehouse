<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skus', function (Blueprint $table) {
            if (!Schema::hasColumn('skus', 'min_stock')) {
                $table->integer('min_stock')->default(5)->after('current_stock');
            }
            if (!Schema::hasColumn('skus', 'max_stock')) {
                $table->integer('max_stock')->default(100)->after('min_stock');
            }
            if (!Schema::hasColumn('skus', 'weight_grams')) {
                $table->decimal('weight_grams', 10, 2)->nullable()->after('base_cost');
            }
            if (!Schema::hasColumn('skus', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('weight_grams');
            }
        });
    }

    public function down(): void
    {
        Schema::table('skus', function (Blueprint $table) {
            $table->dropColumn(['min_stock', 'max_stock', 'weight_grams', 'is_active']);
        });
    }
};
