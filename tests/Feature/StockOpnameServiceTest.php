<?php

use App\Services\StockOpnameService;
use App\Services\StockTransferService;
use App\Services\InboundService;
use App\Services\OutboundService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    foreach (['transaction_items', 'transactions', 'inventory_stocks', 'skus', 'products', 'units', 'locations', 'warehouses', 'users', 'tenants'] as $table) {
        Schema::dropIfExists($table);
    }

    Schema::create('tenants', function ($table) {
        $table->id();
        $table->string('slug');
        $table->string('name');
    });
    Schema::create('users', function ($table) {
        $table->id();
        $table->string('name');
    });
    Schema::create('warehouses', function ($table) {
        $table->id();
        $table->unsignedBigInteger('tenant_id');
        $table->string('name');
        $table->string('code');
        $table->boolean('is_active')->default(true);
    });
    Schema::create('locations', function ($table) {
        $table->id();
        $table->unsignedBigInteger('warehouse_id');
        $table->string('rack_code');
        $table->string('zone')->nullable();
        $table->boolean('is_active')->default(true);
    });
    Schema::create('units', function ($table) {
        $table->id();
        $table->string('symbol');
    });
    Schema::create('products', function ($table) {
        $table->id();
        $table->unsignedBigInteger('tenant_id');
        $table->string('name');
    });
    Schema::create('skus', function ($table) {
        $table->id();
        $table->unsignedBigInteger('product_id');
        $table->unsignedBigInteger('unit_id')->nullable();
        $table->string('sku_code');
        $table->string('barcode')->nullable();
        $table->boolean('is_active')->default(true);
        $table->integer('current_stock')->default(0);
        $table->timestamp('updated_at')->nullable();
    });
    Schema::create('inventory_stocks', function ($table) {
        $table->id();
        $table->unsignedBigInteger('sku_id');
        $table->unsignedBigInteger('location_id');
        $table->integer('quantity')->default(0);
        $table->string('batch_number')->nullable();
        $table->date('expiry_date')->nullable();
        $table->unsignedBigInteger('created_by')->nullable();
        $table->timestamps();
    });
    Schema::create('transactions', function ($table) {
        $table->id();
        $table->unsignedBigInteger('tenant_id');
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('created_by')->nullable();
        $table->string('local_uuid');
        $table->string('status');
        $table->string('sync_status');
        $table->string('transaction_type');
        $table->unsignedBigInteger('warehouse_id')->nullable();
        $table->unsignedBigInteger('location_id')->nullable();
        $table->string('dock_bay')->nullable();
        $table->text('notes')->nullable();
        $table->timestamps();
    });
    Schema::create('transaction_items', function ($table) {
        $table->id();
        $table->unsignedBigInteger('transaction_id');
        $table->unsignedBigInteger('sku_id');
        $table->unsignedBigInteger('from_location_id')->nullable();
        $table->unsignedBigInteger('to_location_id')->nullable();
        $table->integer('quantity');
        $table->integer('good_qty')->default(0);
        $table->integer('damaged_qty')->default(0);
        $table->string('damage_note')->nullable();
        $table->string('batch_number')->nullable();
        $table->date('expiry_date')->nullable();
        $table->timestamp('counted_at')->nullable();
        $table->text('count_notes')->nullable();
        $table->unsignedBigInteger('created_by')->nullable();
        $table->timestamps();
    });
});

function stockOpnameFixture(): array
{
    $tenantId = DB::table('tenants')->insertGetId(['slug' => 'tenant-a', 'name' => 'Tenant A']);
    DB::table('users')->insert(['id' => 1, 'name' => 'Auditor']);
    $warehouseId = DB::table('warehouses')->insertGetId([
        'tenant_id' => $tenantId,
        'name' => 'Gudang Utama',
        'code' => 'WH-01',
        'is_active' => true,
    ]);
    $locationId = DB::table('locations')->insertGetId([
        'warehouse_id' => $warehouseId,
        'rack_code' => 'A-01',
        'zone' => 'A',
    ]);
    $otherLocationId = DB::table('locations')->insertGetId([
        'warehouse_id' => $warehouseId,
        'rack_code' => 'B-01',
        'zone' => 'B',
    ]);
    $unitId = DB::table('units')->insertGetId(['symbol' => 'pcs']);
    $productId = DB::table('products')->insertGetId([
        'tenant_id' => $tenantId,
        'name' => 'Produk Uji',
    ]);
    $skuId = DB::table('skus')->insertGetId([
        'product_id' => $productId,
        'unit_id' => $unitId,
        'sku_code' => 'SKU-001',
        'barcode' => '8990001',
    ]);
    DB::table('inventory_stocks')->insert([
        [
            'sku_id' => $skuId,
            'location_id' => $locationId,
            'quantity' => 3,
            'batch_number' => 'BATCH-A',
            'expiry_date' => '2027-01-01',
        ],
        [
            'sku_id' => $skuId,
            'location_id' => $locationId,
            'quantity' => 2,
            'batch_number' => 'BATCH-A',
            'expiry_date' => '2027-01-01',
        ],
        [
            'sku_id' => $skuId,
            'location_id' => $locationId,
            'quantity' => 4,
            'batch_number' => 'BATCH-B',
            'expiry_date' => '2028-01-01',
        ],
        [
            'sku_id' => $skuId,
            'location_id' => $otherLocationId,
            'quantity' => 8,
            'batch_number' => 'BATCH-C',
            'expiry_date' => '2028-01-01',
        ],
    ]);

    return [$warehouseId, new StockOpnameService];
}

test('creates a rack-scoped snapshot with display fields and uncounted status', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');

    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    $data = $service->getActiveSessionData('tenant-a');
    $mobileData = $service->getActiveSessionData('tenant-a', true);

    expect(DB::table('transaction_items')->where('transaction_id', $session['session_id'])->count())->toBe(2)
        ->and($data['items'])->toHaveCount(2)
        ->and($data['items'][0]['name'])->toBe('Produk Uji')
        ->and($data['items'][0]['rack'])->toBe('A-01')
        ->and($data['items'][0]['status'])->toBe('Belum dihitung')
        ->and($data['session']['warehouse_name'])->toBe('Gudang Utama')
        ->and($data['session']['location_label'])->toBe('A-01 · A')
        ->and(array_key_exists('system_qty', $mobileData['items'][0]))->toBeFalse()
        ->and(array_key_exists('variance', $mobileData['items'][0]))->toBeFalse();
});

test('adds newly stocked barcode items to an active session in its selected rack', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    $productId = DB::table('products')->value('id');
    $unitId = DB::table('units')->value('id');
    $skuId = DB::table('skus')->insertGetId([
        'product_id' => $productId,
        'unit_id' => $unitId,
        'sku_code' => 'SKU-002',
        'barcode' => '8990002',
    ]);
    DB::table('inventory_stocks')->insert([
        [
            'sku_id' => $skuId,
            'location_id' => $locationId,
            'quantity' => 6,
            'batch_number' => 'NEW-BATCH',
            'expiry_date' => '2028-01-01',
        ],
        [
            'sku_id' => $skuId,
            'location_id' => DB::table('locations')->where('rack_code', 'B-01')->value('id'),
            'quantity' => 11,
            'batch_number' => 'OTHER-RACK',
            'expiry_date' => '2028-01-01',
        ],
    ]);

    $added = $service->syncScannedSkuToSession('tenant-a', $session['session_id'], ' 8990002 ', 1);
    $items = $service->getActiveSessionData('tenant-a')['items'];
    $scannedItem = collect($items)->firstWhere('sku', 'SKU-002');

    expect($added)->toBe(1)
        ->and($scannedItem['system_qty'])->toBe(6)
        ->and($scannedItem['status'])->toBe('Belum dihitung');
});

test('mobile barcode scans use the session rack and reject another rack', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationA = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $locationB = DB::table('locations')->where('rack_code', 'B-01')->value('id');
    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationA,
    ], 1);
    $skuId = DB::table('skus')->insertGetId([
        'product_id' => DB::table('products')->value('id'),
        'unit_id' => DB::table('units')->value('id'),
        'sku_code' => 'SKU-MOBILE',
        'barcode' => '899-MOBILE',
    ]);

    $service->updateItemPhysicalQty('tenant-a', [
        'session_id' => $session['session_id'],
        'barcode' => '899-MOBILE',
        'physical_qty' => 3,
    ], 1);

    $item = DB::table('transaction_items')
        ->where('transaction_id', $session['session_id'])
        ->where('sku_id', $skuId)
        ->first();

    expect($item->from_location_id)->toBe($locationA)
        ->and((int) $item->good_qty)->toBe(3);

    expect(fn () => $service->updateItemPhysicalQty('tenant-a', [
        'session_id' => $session['session_id'],
        'barcode' => '899-MOBILE',
        'location_id' => $locationB,
        'physical_qty' => 1,
    ], 1))->toThrow(ValidationException::class);

    expect(fn () => $service->syncOfflineOpname('tenant-a', [
        'session_id' => $session['session_id'],
        'items' => [[
            'sku_id' => $skuId,
            'location_id' => $locationB,
            'physical_qty' => 1,
        ]],
    ], 1))->toThrow(ValidationException::class);

    $service->syncOfflineOpname('tenant-a', [
        'session_id' => $session['session_id'],
        'items' => [[
            'sku_id' => $skuId,
            'physical_qty' => 4,
        ]],
    ], 1);
    $item = DB::table('transaction_items')
        ->where('transaction_id', $session['session_id'])
        ->where('sku_id', $skuId)
        ->first();

    expect((int) $item->good_qty)->toBe(4)
        ->and($item->from_location_id)->toBe($locationA);
});

test('refreshes legacy all-zone sessions without a saved warehouse or snapshot rows', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    DB::table('transactions')->where('id', $session['session_id'])->update([
        'warehouse_id' => null,
        'location_id' => null,
        'dock_bay' => 'ALL',
    ]);
    DB::table('transaction_items')->where('transaction_id', $session['session_id'])->delete();

    $added = $service->syncScannedSkuToSession('tenant-a', $session['session_id'], '8990001', 1);

    expect($added)->toBe(3)
        ->and(DB::table('transaction_items')->where('transaction_id', $session['session_id'])->count())->toBe(3);
});

test('allows separate active racks and rejects overlapping sessions', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationA = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $locationB = DB::table('locations')->where('rack_code', 'B-01')->value('id');

    $rackASession = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationA,
    ], 1);
    $rackBSession = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationB,
    ], 1);

    expect($rackBSession['session_id'])->not->toBe($rackASession['session_id']);
    expect(fn () => $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationA,
    ], 1))->toThrow(ValidationException::class);
});

test('infers a legacy session warehouse when its warehouse id is missing', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $legacySession = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    DB::table('transactions')->where('id', $legacySession['session_id'])->update([
        'warehouse_id' => null,
        'location_id' => null,
        'dock_bay' => 'ALL',
    ]);

    $otherWarehouseId = DB::table('warehouses')->insertGetId([
        'tenant_id' => DB::table('tenants')->where('slug', 'tenant-a')->value('id'),
        'name' => 'Gudang Kedua',
        'code' => 'WH-02',
        'is_active' => true,
    ]);
    $otherLocationId = DB::table('locations')->insertGetId([
        'warehouse_id' => $otherWarehouseId,
        'rack_code' => 'C-01',
        'zone' => 'C',
        'is_active' => true,
    ]);
    DB::table('inventory_stocks')->insert([
        'sku_id' => DB::table('skus')->value('id'),
        'location_id' => $otherLocationId,
        'quantity' => 2,
        'batch_number' => 'OTHER-WAREHOUSE',
        'expiry_date' => '2028-01-01',
    ]);

    $newWarehouseSession = $service->createSession('tenant-a', [
        'warehouse_id' => $otherWarehouseId,
        'location_id' => $otherLocationId,
    ], 1);

    expect($newWarehouseSession['session_id'])->not->toBe($legacySession['session_id']);
    expect(fn () => $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => DB::table('locations')->where('rack_code', 'B-01')->value('id'),
    ], 1))->toThrow(ValidationException::class);
});

test('loads a completed session by id for read-only history', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    DB::table('transactions')->where('id', $session['session_id'])->update(['status' => 'ADJUSTED']);

    $history = $service->getSessionData('tenant-a', $session['session_id']);

    expect($history['session']['id'])->toBe($session['session_id'])
        ->and($history['session']['status'])->toBe('ADJUSTED')
        ->and($history['items'])->toHaveCount(2)
        ->and($service->getActiveSessionData('tenant-a')['session'])->toBeNull();
});

test('mobile API lists sessions and loads a selected completed session', function () {
    [$warehouseId] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $session = app(StockOpnameService::class)->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => $locationId,
    ], 1);
    DB::table('transactions')->where('id', $session['session_id'])->update(['status' => 'ADJUSTED']);

    $this->withoutMiddleware()
        ->getJson('/api/tenant-a/stock-opname')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.data.0.id', $session['session_id'])
        ->assertJsonPath('data.data.0.status', 'ADJUSTED')
        ->assertJsonPath('data.data.0.location_label', 'A-01 · A')
        ->assertJsonPath('data.data.0.total_items', 2);

    $this->getJson("/api/tenant-a/stock-opname/sessions/{$session['session_id']}")
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.session.id', $session['session_id'])
        ->assertJsonPath('data.session.status', 'ADJUSTED')
        ->assertJsonPath('data.items.0.is_counted', false)
        ->assertJsonMissingPath('data.items.0.system_qty');
});

test('syncs stock transfer using transaction uuid idempotently', function () {
    [$warehouseId] = stockOpnameFixture();
    $fromLocationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $toLocationId = DB::table('locations')->where('rack_code', 'B-01')->value('id');
    $skuId = DB::table('skus')->value('id');
    $service = new StockTransferService;
    $payload = [
        'transaction_uuid' => 'offline-transfer-uuid-1',
        'items' => [[
            'sku_id' => $skuId,
            'from_location_id' => $fromLocationId,
            'to_location_id' => $toLocationId,
            'quantity' => 2,
            'batch_number' => 'BATCH-A',
            'expiry_date' => '2027-01-01',
        ]],
    ];

    $first = $service->syncOfflineTransfer('tenant-a', $payload, 1);
    $second = $service->syncOfflineTransfer('tenant-a', $payload, 1);

    expect($first['already_synced'])->toBeFalse()
        ->and($second['already_synced'])->toBeTrue()
        ->and($second['transfer_code'])->toBe('offline-transfer-uuid-1')
        ->and((int) DB::table('inventory_stocks')
            ->where('sku_id', $skuId)
            ->where('location_id', $fromLocationId)
            ->sum('quantity'))->toBe(7)
        ->and((int) DB::table('inventory_stocks')
            ->where('sku_id', $skuId)
            ->where('location_id', $toLocationId)
            ->sum('quantity'))->toBe(10)
        ->and(DB::table('transactions')
            ->where('local_uuid', 'offline-transfer-uuid-1')
            ->count())->toBe(1);
});

test('offline inbound and outbound sync existing manifests and commit without adding manifest items', function () {
    [$warehouseId] = stockOpnameFixture();
    $locationId = DB::table('locations')->where('rack_code', 'A-01')->value('id');
    $skuId = DB::table('skus')->value('id');

    $inboundId = DB::table('transactions')->insertGetId([
        'tenant_id' => DB::table('tenants')->value('id'),
        'user_id' => 1,
        'created_by' => 1,
        'local_uuid' => 'INBOUND-EXISTING',
        'status' => 'DRAFT',
        'sync_status' => 'PENDING',
        'transaction_type' => 'INBOUND',
        'warehouse_id' => $warehouseId,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $inboundItemId = DB::table('transaction_items')->insertGetId([
        'transaction_id' => $inboundId,
        'sku_id' => $skuId,
        'to_location_id' => $locationId,
        'quantity' => 2,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $outboundId = DB::table('transactions')->insertGetId([
        'tenant_id' => DB::table('tenants')->value('id'),
        'user_id' => 1,
        'created_by' => 1,
        'local_uuid' => 'OUTBOUND-EXISTING',
        'status' => 'DRAFT',
        'sync_status' => 'PENDING',
        'transaction_type' => 'OUTBOUND',
        'warehouse_id' => $warehouseId,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $outboundItemId = DB::table('transaction_items')->insertGetId([
        'transaction_id' => $outboundId,
        'sku_id' => $skuId,
        'from_location_id' => $locationId,
        'quantity' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    (new InboundService)->syncOfflineManifest('tenant-a', [
        'manifest_code' => 'INBOUND-EXISTING',
        'should_commit' => true,
        'items' => [[
            'sku_id' => $skuId,
            'good_qty' => 2,
            'damaged_qty' => 0,
            'target_rack' => 'A-01',
        ]],
    ], 1);
    (new OutboundService)->syncOfflineManifest('tenant-a', [
        'manifest_code' => 'OUTBOUND-EXISTING',
        'should_commit' => true,
        'items' => [[
            'sku_id' => $skuId,
            'good_qty' => 1,
            'damaged_qty' => 0,
            'source_rack' => 'A-01',
        ]],
    ], 1);

    expect(DB::table('transactions')->where('transaction_type', 'INBOUND')->count())->toBe(1)
        ->and(DB::table('transactions')->where('transaction_type', 'OUTBOUND')->count())->toBe(1)
        ->and(DB::table('transaction_items')->where('transaction_id', $inboundId)->count())->toBe(1)
        ->and(DB::table('transaction_items')->where('transaction_id', $outboundId)->count())->toBe(1)
        ->and(DB::table('transaction_items')->where('id', $inboundItemId)->value('good_qty'))->toBe(2)
        ->and(DB::table('transaction_items')->where('id', $outboundItemId)->value('good_qty'))->toBe(1)
        ->and(DB::table('transactions')->where('id', $inboundId)->value('status'))->toBe('COMMITTED')
        ->and(DB::table('transactions')->where('id', $outboundId)->value('status'))->toBe('COMMITTED');

    expect(fn () => (new InboundService)->syncOfflineManifest('tenant-a', [
        'manifest_code' => 'UNKNOWN-INBOUND',
        'items' => [['sku_id' => $skuId, 'good_qty' => 1]],
    ], 1))->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
    expect(fn () => (new OutboundService)->syncOfflineManifest('tenant-a', [
        'manifest_code' => 'UNKNOWN-OUTBOUND',
        'items' => [['sku_id' => $skuId, 'good_qty' => 1]],
    ], 1))->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);

    expect(DB::table('transactions')->where('local_uuid', 'UNKNOWN-INBOUND')->exists())->toBeFalse()
        ->and(DB::table('transactions')->where('local_uuid', 'UNKNOWN-OUTBOUND')->exists())->toBeFalse();
});

test('requires every line to be counted and adjusts only the matching stock batches', function () {
    [$warehouseId, $service] = stockOpnameFixture();
    $session = $service->createSession('tenant-a', [
        'warehouse_id' => $warehouseId,
        'location_id' => 'all',
    ], 1);

    expect(fn () => $service->executeAdjustment('tenant-a', $session['session_id'], 1))
        ->toThrow(ValidationException::class);

    $items = DB::table('transaction_items')
        ->where('transaction_id', $session['session_id'])
        ->get()
        ->keyBy('batch_number');

    $service->updateItemPhysicalQty('tenant-a', [
        'item_id' => $items['BATCH-A']->id,
        'physical_qty' => 7,
        'notes' => 'Dihitung ulang',
    ], 1);
    $service->updateItemPhysicalQty('tenant-a', [
        'item_id' => $items['BATCH-B']->id,
        'physical_qty' => 3,
    ], 1);
    $service->updateItemPhysicalQty('tenant-a', [
        'item_id' => $items['BATCH-C']->id,
        'physical_qty' => 8,
    ], 1);

    expect($service->executeAdjustment('tenant-a', $session['session_id'], 1))->toBeTrue();

    $batches = DB::table('inventory_stocks')
        ->where('location_id', $items['BATCH-A']->from_location_id)
        ->select('batch_number', DB::raw('SUM(quantity) as quantity'))
        ->groupBy('batch_number')
        ->pluck('quantity', 'batch_number');

    expect((int) $batches['BATCH-A'])->toBe(7)
        ->and((int) $batches['BATCH-B'])->toBe(3)
        ->and((int) DB::table('skus')->where('id', $items['BATCH-A']->sku_id)->value('current_stock'))->toBe(18);
});
