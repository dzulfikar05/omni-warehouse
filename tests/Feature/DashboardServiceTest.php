<?php

use App\Services\DashboardService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    foreach (['transaction_items', 'transactions', 'skus', 'products'] as $table) {
        Schema::dropIfExists($table);
    }

    Schema::create('products', function ($table) {
        $table->id();
        $table->foreignId('tenant_id');
    });

    Schema::create('skus', function ($table) {
        $table->id();
        $table->foreignId('product_id');
    });

    Schema::create('transactions', function ($table) {
        $table->id();
        $table->foreignId('tenant_id');
        $table->string('transaction_type');
        $table->string('status');
        $table->date('transaction_date');
    });

    Schema::create('transaction_items', function ($table) {
        $table->id();
        $table->foreignId('transaction_id');
        $table->integer('quantity');
    });

    Carbon::setTestNow('2026-11-26 12:00:00');
});

afterEach(function () {
    Carbon::setTestNow();

    foreach (['transaction_items', 'transactions', 'skus', 'products'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('uses transaction types and statuses from the transaction schema', function () {
    DB::table('products')->insert(['id' => 1, 'tenant_id' => 7]);
    DB::table('skus')->insert(['id' => 1, 'product_id' => 1]);
    DB::table('transactions')->insert([
        ['id' => 1, 'tenant_id' => 7, 'transaction_type' => 'INBOUND', 'status' => 'COMMITTED', 'transaction_date' => now()->toDateString()],
        ['id' => 2, 'tenant_id' => 7, 'transaction_type' => 'OUTBOUND', 'status' => 'PICKING', 'transaction_date' => now()->toDateString()],
    ]);
    DB::table('transaction_items')->insert([
        ['transaction_id' => 1, 'quantity' => 12],
        ['transaction_id' => 2, 'quantity' => 3],
    ]);

    $service = new DashboardService;

    expect($service->getSummaryStats(7))->toBe([
        'total_skus' => 1,
        'total_products' => 1,
        'stock_in_this_month' => 12,
        'stock_out_this_month' => 3,
    ]);

    expect($service->getInboundVsOutboundComparison(7))->toBe([
        'inbound' => ['completed' => 1, 'pending' => 0],
        'outbound' => ['completed' => 0, 'pending' => 1],
    ]);
});
