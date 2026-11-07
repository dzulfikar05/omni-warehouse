<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| Public Auth Routes (Global Gateway)
|--------------------------------------------------------------------------
*/
Route::post('/verify-tenant', [AuthController::class, 'verifyTenant'])
    ->middleware('throttle:10,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

/*
|--------------------------------------------------------------------------
| Protected Tenant Routes (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
});

Route::get('/health-check', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Server WMS Laravel aktif di Port 80',
        'timestamp' => now()->toIso8601String(),
    ]);
});
