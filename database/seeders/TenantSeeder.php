<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\GeneralSetting;
use App\Models\InventoryStock;
use App\Models\Location;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Sku;
use App\Models\Subscription;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------------------------------
        // 1. PLAN & TENANT BASE DATA
        // ----------------------------------------------------
        $proPlan = Plan::firstOrCreate(
            ['slug' => 'pro-plan'],
            [
                'name' => 'Pro Plan',
                'desc' => 'Paket lengkap untuk bisnis menengah',
                'price' => 250000.00,
                'is_active' => true,
            ]
        );

        $tenant = Tenant::firstOrCreate(
            ['slug' => 'demo-tenant'],
            [
                'name' => 'PT Demo Logistik',
                'phone' => '081234567890',
                'address' => 'Jl. Soekarno Hatta No. 123, Malang',
            ]
        );

        Subscription::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id' => $proPlan->id,
                'status' => 'active',
                'ends_at' => now()->addYear(),
            ]
        );

        GeneralSetting::firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'company_name'],
            ['value' => 'PT Demo Logistik']
        );

        // ----------------------------------------------------
        // 2. ROLES & ALL TENANT PERMISSIONS SYNC
        // ----------------------------------------------------
        $adminRole = Role::firstOrCreate(
            [
                'name' => 'Admin Gudang',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ],
            [
                'desc' => 'Administrator penuh operasional gudang tenant',
            ]
        );

        // Ambil SELURUH permission tenant.* dari PermissionSeeder dan sinkronkan ke Role
        $tenantPermissions = Permission::where('name', 'LIKE', 'tenant.%')->get();
        $adminRole->syncPermissions($tenantPermissions);

        // ----------------------------------------------------
        // 3. USER DEMO TENANT
        // ----------------------------------------------------
        $user = User::firstOrCreate(
            ['email' => 'budi@demo-tenant.com'],
            [
                'tenant_id' => $tenant->id,
                'username' => 'demoadmin',
                'name' => 'Budi Operator',
                'password' => Hash::make('password'),
            ]
        );

        if (! $user->hasRole($adminRole->name)) {
            $user->assignRole($adminRole);
        }

        // ----------------------------------------------------
        // 4. CATEGORIES & UNITS
        // ----------------------------------------------------
        $categoriesData = [
            ['name' => 'Electronics & Gadgets', 'desc' => 'Perangkat dan komponen elektronik modern'],
            ['name' => 'Apparel & Fashion', 'desc' => 'Produk pakaian dan tekstil pria/wanita'],
            ['name' => 'Office Supplies', 'desc' => 'Peralatan kantor dan alat tulis'],
            ['name' => 'Food & Beverages', 'desc' => 'Bahan makanan dan minuman terkemasan'],
            ['name' => 'Hardware & Tools', 'desc' => 'Perkakas teknik dan mesin operasional'],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['name']] = Category::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $cat['name']],
                ['desc' => $cat['desc'], 'created_by' => $user->id]
            );
        }

        $unitsData = [
            ['name' => 'Pieces', 'symbol' => 'Pcs'],
            ['name' => 'Box', 'symbol' => 'Box'],
            ['name' => 'Carton', 'symbol' => 'Ctn'],
            ['name' => 'Kilogram', 'symbol' => 'Kg'],
        ];

        $units = [];
        foreach ($unitsData as $u) {
            $units[$u['symbol']] = Unit::firstOrCreate(
                ['name' => $u['name'], 'symbol' => $u['symbol']],
                ['created_by' => $user->id]
            );
        }

        // ----------------------------------------------------
        // 5. PRODUCTS & SKUS (8 Produk Variatif)
        // ----------------------------------------------------
        $productsData = [
            [
                'name' => 'Laptop ThinkPad X1 Carbon',
                'cat' => 'Electronics & Gadgets',
                'sku' => 'SKU-TPX1-001',
                'unit' => 'Pcs',
                'barcode' => '889842100112',
                'cost' => 18500000.00,
            ],
            [
                'name' => 'Monitor Dell UltraSharp 27"',
                'cat' => 'Electronics & Gadgets',
                'sku' => 'SKU-DELL27-002',
                'unit' => 'Pcs',
                'barcode' => '889842100113',
                'cost' => 6200000.00,
            ],
            [
                'name' => 'Mouse Wireless Logitech MX Master 3S',
                'cat' => 'Electronics & Gadgets',
                'sku' => 'SKU-LOGI-MX3S',
                'unit' => 'Pcs',
                'barcode' => '889842100114',
                'cost' => 1450000.00,
            ],
            [
                'name' => 'Kemeja Polos Premium XL',
                'cat' => 'Apparel & Fashion',
                'sku' => 'SKU-KPM-XL',
                'unit' => 'Pcs',
                'barcode' => '889842100555',
                'cost' => 120000.00,
            ],
            [
                'name' => 'Jaket Windbreaker Waterproof L',
                'cat' => 'Apparel & Fashion',
                'sku' => 'SKU-JKT-WPB-L',
                'unit' => 'Pcs',
                'barcode' => '889842100556',
                'cost' => 280000.00,
            ],
            [
                'name' => 'Kertas A4 80gsm PaperOne',
                'cat' => 'Office Supplies',
                'sku' => 'SKU-P1-A4-80',
                'unit' => 'Box',
                'barcode' => '889842100888',
                'cost' => 240000.00,
            ],
            [
                'name' => 'Kopi Biji Arabika Gayo 1kg',
                'cat' => 'Food & Beverages',
                'sku' => 'SKU-ARAB-GY-1KG',
                'unit' => 'Kg',
                'barcode' => '889842100999',
                'cost' => 180000.00,
            ],
            [
                'name' => 'Set Obeng Presisi 32-in-1',
                'cat' => 'Hardware & Tools',
                'sku' => 'SKU-TOOL-OBG-32',
                'unit' => 'Pcs',
                'barcode' => '889842100777',
                'cost' => 95000.00,
            ],
        ];

        $skus = [];
        foreach ($productsData as $pData) {
            $product = Product::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $pData['name']],
                ['category_id' => $categories[$pData['cat']]->id, 'created_by' => $user->id]
            );

            $skus[$pData['sku']] = Sku::firstOrCreate(
                ['sku_code' => $pData['sku']],
                [
                    'product_id' => $product->id,
                    'unit_id' => $units[$pData['unit']]->id,
                    'barcode' => $pData['barcode'],
                    'base_cost' => $pData['cost'],
                    'created_by' => $user->id,
                ]
            );
        }

        // ----------------------------------------------------
        // 6. SUPPLIERS & CUSTOMERS
        // ----------------------------------------------------
        $suppliersData = [
            [
                'name' => 'PT Distribusi Utama Elektronik',
                'email' => 'sales@distributorelektronik.co.id',
                'pic' => 'Bambang Herdian',
                'phone' => '0215554321',
                'notes' => 'Pemasok utama komponen IT & Gadgets',
            ],
            [
                'name' => 'CV Tekstil Nusantara Malang',
                'email' => 'order@tekstilnusantara.com',
                'pic' => 'Siti Rahmawati',
                'phone' => '0341888999',
                'notes' => 'Pemasok bahan pakaian dan konveksi',
            ],
            [
                'name' => 'PT Perkakas Jaya Teknik',
                'email' => 'info@perkakasjaya.co.id',
                'pic' => 'Hendrik Kurniawan',
                'phone' => '031777666',
                'notes' => 'Supplier perkakas mesin dan hardware',
            ],
            [
                'name' => 'UD Kopi Nusantara',
                'email' => 'grosir@kopinusantara.id',
                'pic' => 'Agus Santoso',
                'phone' => '081333444555',
                'notes' => 'Distributor kopi lokal dan bahan pangan',
            ],
        ];

        $suppliers = [];
        foreach ($suppliersData as $s) {
            $suppliers[$s['email']] = Supplier::firstOrCreate(
                ['tenant_id' => $tenant->id, 'email' => $s['email']],
                [
                    'name' => $s['name'],
                    'pic' => $s['pic'],
                    'phone' => $s['phone'],
                    'notes' => $s['notes'],
                    'created_by' => $user->id,
                ]
            );
        }

        $customersData = [
            [
                'name' => 'Toko Maju Bersama',
                'email' => 'contact@tokomaju.com',
                'phone' => '081987654321',
                'notes' => 'Pelanggan Grosir Malang Kota',
            ],
            [
                'name' => 'PT Sinarmas Retail Mandiri',
                'email' => 'procurement@sinarmasretail.com',
                'phone' => '02199988877',
                'notes' => 'Klien korporat bulanan',
            ],
            [
                'name' => 'Toko Komputer Graha Tech',
                'email' => 'owner@grahatech.id',
                'phone' => '0341554433',
                'notes' => 'Retailer elektronik reseller',
            ],
            [
                'name' => 'Cafe & Roastery Kopi Kita',
                'email' => 'hello@kopikita.com',
                'phone' => '081222333444',
                'notes' => 'Klien bahan baku F&B harian',
            ],
        ];

        $customers = [];
        foreach ($customersData as $c) {
            $customers[$c['email']] = Customer::firstOrCreate(
                ['tenant_id' => $tenant->id, 'email' => $c['email']],
                [
                    'name' => $c['name'],
                    'phone' => $c['phone'],
                    'notes' => $c['notes'],
                    'created_by' => $user->id,
                ]
            );
        }

        // ----------------------------------------------------
        // 7. WAREHOUSES, LOCATIONS, & INVENTORY STOCKS
        // ----------------------------------------------------
        $whUtama = Warehouse::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'WH-MLG-01'],
            [
                'name' => 'Gudang Pusat Malang',
                'desc' => 'Gudang operasional utama Jawa Timur',
                'is_active' => true,
                'created_by' => $user->id,
            ]
        );

        $whTransit = Warehouse::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'WH-MLG-02'],
            [
                'name' => 'Gudang Transit & Sorting',
                'desc' => 'Pusat sortir barang masuk dan keluar',
                'is_active' => true,
                'created_by' => $user->id,
            ]
        );

        $locationsData = [
            ['wh' => $whUtama, 'rack' => 'RACK-A1-01', 'zone' => 'Zona Elektronik'],
            ['wh' => $whUtama, 'rack' => 'RACK-A1-02', 'zone' => 'Zona Elektronik'],
            ['wh' => $whUtama, 'rack' => 'RACK-B1-01', 'zone' => 'Zona Tekstil & Pakaian'],
            ['wh' => $whUtama, 'rack' => 'RACK-C1-01', 'zone' => 'Zona Serba Ada'],
            ['wh' => $whTransit, 'rack' => 'INBOUND-ZONE-01', 'zone' => 'Area Staging Inbound'],
            ['wh' => $whTransit, 'rack' => 'OUTBOUND-ZONE-01', 'zone' => 'Area Packing Outbound'],
        ];

        $locations = [];
        foreach ($locationsData as $loc) {
            $locations[$loc['rack']] = Location::firstOrCreate(
                ['warehouse_id' => $loc['wh']->id, 'rack_code' => $loc['rack']],
                ['zone' => $loc['zone'], 'created_by' => $user->id]
            );
        }

        // Distribusi Stok Barang
        $stocksData = [
            ['sku' => 'SKU-TPX1-001', 'rack' => 'RACK-A1-01', 'qty' => 30, 'batch' => 'BATCH-2026-001'],
            ['sku' => 'SKU-DELL27-002', 'rack' => 'RACK-A1-02', 'qty' => 15, 'batch' => 'BATCH-2026-002'],
            ['sku' => 'SKU-LOGI-MX3S', 'rack' => 'RACK-A1-01', 'qty' => 80, 'batch' => 'BATCH-2026-003'],
            ['sku' => 'SKU-KPM-XL', 'rack' => 'RACK-B1-01', 'qty' => 200, 'batch' => 'BATCH-2026-004'],
            ['sku' => 'SKU-JKT-WPB-L', 'rack' => 'RACK-B1-01', 'qty' => 120, 'batch' => 'BATCH-2026-005'],
            ['sku' => 'SKU-P1-A4-80', 'rack' => 'RACK-C1-01', 'qty' => 50, 'batch' => 'BATCH-2026-006'],
            ['sku' => 'SKU-ARAB-GY-1KG', 'rack' => 'RACK-C1-01', 'qty' => 100, 'batch' => 'BATCH-2026-007'],
            ['sku' => 'SKU-TOOL-OBG-32', 'rack' => 'INBOUND-ZONE-01', 'qty' => 45, 'batch' => 'BATCH-2026-008'],
        ];

        foreach ($stocksData as $st) {
            InventoryStock::firstOrCreate(
                ['sku_id' => $skus[$st['sku']]->id, 'location_id' => $locations[$st['rack']]->id],
                [
                    'quantity' => $st['qty'],
                    'batch_number' => $st['batch'],
                    'expiry_date' => null,
                    'created_by' => $user->id,
                ]
            );
        }

        // ----------------------------------------------------
        // 8. TRANSACTIONS & TRANSACTION ITEMS DUMMY
        // ----------------------------------------------------
        // Transaksi 1: Barang Masuk (IN)
        $tx1 = Transaction::firstOrCreate(
            ['local_uuid' => 'TX-IN-20260901-001'],
            [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'supplier_id' => $suppliers['sales@distributorelektronik.co.id']->id,
                'status' => 'completed',
                'sync_status' => 'synced',
                'transaction_type' => 'IN',
                'created_by' => $user->id,
            ]
        );

        TransactionItem::firstOrCreate(
            ['transaction_id' => $tx1->id, 'sku_id' => $skus['SKU-TPX1-001']->id],
            [
                'to_location_id' => $locations['RACK-A1-01']->id,
                'quantity' => 10,
                'unit_price' => 18500000.00,
                'serial_number' => 'SN-TPX1-202609010',
                'created_by' => $user->id,
            ]
        );

        // Transaksi 2: Barang Keluar (OUT)
        $tx2 = Transaction::firstOrCreate(
            ['local_uuid' => 'TX-OUT-20260905-002'],
            [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'customer_id' => $customers['contact@tokomaju.com']->id,
                'status' => 'completed',
                'sync_status' => 'synced',
                'transaction_type' => 'OUT',
                'created_by' => $user->id,
            ]
        );

        TransactionItem::firstOrCreate(
            ['transaction_id' => $tx2->id, 'sku_id' => $skus['SKU-KPM-XL']->id],
            [
                'from_location_id' => $locations['RACK-B1-01']->id,
                'quantity' => 20,
                'unit_price' => 150000.00,
                'created_by' => $user->id,
            ]
        );

        // Transaksi 3: Stock Transfer Antar Gudang/Rak (TRANSFER)
        $tx3 = Transaction::firstOrCreate(
            ['local_uuid' => 'TX-TRF-20260910-003'],
            [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'status' => 'completed',
                'sync_status' => 'synced',
                'transaction_type' => 'TRANSFER',
                'created_by' => $user->id,
            ]
        );

        TransactionItem::firstOrCreate(
            ['transaction_id' => $tx3->id, 'sku_id' => $skus['SKU-LOGI-MX3S']->id],
            [
                'from_location_id' => $locations['RACK-A1-01']->id,
                'to_location_id' => $locations['OUTBOUND-ZONE-01']->id,
                'quantity' => 5,
                'unit_price' => 1450000.00,
                'created_by' => $user->id,
            ]
        );
    }
}
