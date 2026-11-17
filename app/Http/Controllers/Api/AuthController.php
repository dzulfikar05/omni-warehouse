<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Step 1: Validasi keberadaan dan status aktif Tenant.
     */
    public function verifyTenant(Request $request)
    {
        $request->validate([
            'workspace_slug' => 'required|string',
        ]);

        $tenant = Tenant::where('slug', $request->workspace_slug)->first();

        if (!$tenant || $tenant->status !== 'active') {
            return response()->json([
                'message' => 'Workspace tidak ditemukan atau sedang dinonaktifkan.',
            ], 403);
        }

        return response()->json([
            'message' => 'Workspace tervalidasi.',
            'data' => [
                'tenant_id' => $tenant->id,
                'name'      => $tenant->name,
                'slug'      => $tenant->slug,
            ]
        ], 200);
    }

    /**
     * Step 2: Autentikasi Pengguna & Penerbitan Bearer Token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'workspace_slug' => 'required|string',
            'email'          => 'required|email',
            'password'       => 'required|string',
            'device_name'    => 'nullable|string',
        ]);

        // 1. Cari & Validasi Tenant
        $tenant = Tenant::where('slug', $request->workspace_slug)->first();

        if (!$tenant || $tenant->status !== 'active') {
            return response()->json([
                'message' => 'Akses workspace tidak sah atau tidak aktif.',
            ], 403);
        }

        // 2. Cari User yang Terisolasi pada Tenant Ini
        $user = User::where('tenant_id', $tenant->id)
                    ->where('email', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial email atau password salah.'],
            ]);
        }

        // 3. Validasi Status Keaktifan User (Opsional)
        if (isset($user->is_active) && !$user->is_active) {
            return response()->json([
                'message' => 'Akun pengguna Anda telah dinonaktifkan.',
            ], 403);
        }

        // 4. Revoke Token Lama untuk Perangkat yang Sama (Single Device Session)
        $deviceName = $request->device_name ?? 'mobile_handheld';
        $user->tokens()->where('name', $deviceName)->delete();

        // 5. Terbitkan Token Sanctum Baru
        $token = $user->createToken($deviceName)->plainTextToken;

        // 6. Load Relasi Tenant ke Objek User
        $user->load('tenant:id,name,slug');

        // 7. Kembalikan Respon JSON (Sesuai Kontrak AuthSession.fromJson di Flutter)
        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'user'  => [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'tenant_id' => $user->tenant_id,
                    'role'      => $user->role_names->first() ?? 'Operator',
                    'tenant'    => [
                        'id'   => $tenant->id,
                        'name' => $tenant->name,
                        'slug' => $tenant->slug,
                    ]
                ]
            ]
        ], 200);
    }

    /**
     * Logout & Revoke Token Saat Ini.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil keluar dari sesi.',
        ], 200);
    }

    /**
     * Mendapatkan Profil User Aktif.
     */
    public function profile(Request $request)
    {
        return response()->json([
            'data' => $request->user()->load('tenant:id,name,slug')
        ], 200);
    }
}
