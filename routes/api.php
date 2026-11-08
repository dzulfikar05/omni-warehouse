<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InboundController;

/*
|--------------------------------------------------------------------------
| Public Auth Routes (Global Gateway)
|--------------------------------------------------------------------------
*/
Route::post('/verify-tenant', [AuthController::class, 'verifyTenant'])
    ->middleware('throttle:10,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::get('/health-check', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Server WMS Laravel aktif di Port 80',
        'timestamp' => now()->toIso8601String(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Protected Tenant Routes (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
   

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    /*
    |--------------------------------------------------------------------------
    | Inbound Operations (Multi-tenant Scoped)
    |--------------------------------------------------------------------------
    */
    Route::prefix('{tenant_slug}/inbound')->group(function () {
        Route::get('/options', [InboundController::class, 'options']);
        Route::get('/', [InboundController::class, 'index']);
        Route::get('/manifests/{manifest_code}', [InboundController::class, 'show']);

        Route::post('/store', [InboundController::class, 'store']);
        Route::post('/adhoc', [InboundController::class, 'storeAdhoc']);

        Route::post('/scan-item', [InboundController::class, 'scanItem']);
        Route::post('/putaway', [InboundController::class, 'updatePutaway']);

        Route::post('/commit', [InboundController::class, 'commit']);
        Route::post('/hold', [InboundController::class, 'hold']);
        Route::post('/resume', [InboundController::class, 'resume']);
    });
});
