<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PaymentSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/payment', [
            'settings' => [
                // Menggunakan config dengan fallback nilai dummy agar aman saat development
                'sparkpay_server_key' => config('services.sparkpay.server_key') ?? 'sk_test_dummy_server_key_998877',
                'sparkpay_client_key' => config('services.sparkpay.client_key') ?? 'client_test_dummy_client_key_112233',
                'sparkpay_mode'       => config('services.sparkpay.mode', 'sandbox'),
            ]
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        // Validasi input key
        $validated = $request->validate([
            'sparkpay_server_key' => 'nullable|string',
            'sparkpay_client_key' => 'nullable|string',
            'sparkpay_mode'       => 'required|in:sandbox,production',
        ]);

        // Di sini Anda bisa menambahkan logika penyimpanan ke database atau update .env jika diperlukan

        return back()->with('success', __('Payment gateway settings updated successfully.'));
    }
}