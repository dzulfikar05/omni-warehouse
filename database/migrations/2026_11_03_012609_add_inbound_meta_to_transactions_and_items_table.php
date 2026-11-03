<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('vehicle_no')->nullable()->after('status');
            $table->string('driver_name')->nullable()->after('vehicle_no');
            $table->string('dock_bay')->nullable()->after('driver_name');
            $table->text('notes')->nullable()->after('dock_bay');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->integer('good_qty')->default(0)->after('quantity');
            $table->integer('damaged_qty')->default(0)->after('good_qty');
            $table->text('damage_note')->nullable()->after('damaged_qty');
            $table->string('batch_number')->nullable()->after('damage_note');
            $table->date('expiry_date')->nullable()->after('batch_number');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['vehicle_no', 'driver_name', 'dock_bay', 'notes']);
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn(['good_qty', 'damaged_qty', 'damage_note', 'batch_number', 'expiry_date']);
        });
    }
};
