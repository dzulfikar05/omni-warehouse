<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'desc')) {
                $table->string('desc')->nullable()->after('zone');
            }
            if (!Schema::hasColumn('locations', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('desc');
            }
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['desc', 'is_active']);
        });
    }
};
