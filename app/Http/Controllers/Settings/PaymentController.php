<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function createPaymentLink(Request $request, string $tenant_slug): JsonResponse
    {
        // Cari tenant berdasarkan slug yang sesuai dengan TenantSeeder ('demo-tenant')
        $tenant = Tenant::with('subscription.plan')->where('slug', $tenant_slug)->firstOrFail();
        
        // Ambil harga dari plan aktif tenant yang tersimpan di seeder (misal: Pro Plan / Pro Warehouse)
        // Jika tidak ada subscription/plan, gunakan nilai default dari request atau 150000
        $defaultAmount = $tenant->subscription && $tenant->subscription->plan 
            ? $tenant->subscription->plan->price 
            : 150000;

        $grossAmount = $request->input('amount', $defaultAmount);
        $planName = $tenant->subscription && $tenant->subscription->plan 
            ? $tenant->subscription->plan->name 
            : 'OmniWarehouse Subscription';

        // Payload disesuaikan dengan data tenant seeder (PT Demo Logistik, email user, dll)
        $payload = [
            'transaction_details' => [
                'order_id'     => 'WH-INV-' . time(),
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $tenant->name, // Contoh: 'PT Demo Logistik'
                'phone'      => $tenant->phone, // Contoh: '081234567890'
                'email'      => $request->user()->email ?? 'budi@demo-tenant.com', // Sesuai user seeder
            ],
            'item_details' => [
                [
                    'id'       => $tenant->subscription->plan_id ?? 'PLAN-DEFAULT',
                    'price'    => $grossAmount,
                    'quantity' => 1,
                    'name'     => $planName,
                ]
            ]
        ];

        // Request ke API Sparkpay menggunakan Server Key dari konfigurasi
        $response = Http::withBasicAuth(config('services.sparkpay.server_key'), '')
            ->post(config('services.sparkpay.base_url') . '/api/payment-links', $payload);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Gagal membuat tautan pembayaran.',
                'error'   => $response->json()
            ], 422);
        }

        $data = $response->json();

        return response()->json([
            'token'        => $data['token'] ?? null, // Token / slug Snap Sparkpay
            'redirect_url' => $data['redirect_url'] ?? null,
        ]);
    }
}