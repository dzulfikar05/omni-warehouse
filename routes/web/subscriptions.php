<?php

use App\Http\Controllers\Admin\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->name('admin.')->group(function () {

    // Submenu: Subscriptions Management
    Route::prefix('subscriptions')->name('subscriptions.')->group(function () {

        // Index / View Subscriptions
        Route::get('/', [SubscriptionController::class, 'index'])
            ->middleware('permission:central.subscriptions.view')
            ->name('index');

        // Form Create Manual Invoice
        Route::get('/create-invoice', [SubscriptionController::class, 'createInvoice'])
            ->middleware('permission:central.subscriptions.create_invoice')
            ->name('create-invoice');

        // Store Manual Invoice
        Route::post('/invoices', [SubscriptionController::class, 'storeInvoice'])
            ->middleware('permission:central.subscriptions.create_invoice')
            ->name('store-invoice');

        // Async Export PDF & Excel
        Route::post('/export-pdf', [SubscriptionController::class, 'exportPdf'])
            ->middleware('permission:central.subscriptions.export')
            ->name('export-pdf');

        Route::post('/export-excel', [SubscriptionController::class, 'exportExcel'])
            ->middleware('permission:central.subscriptions.export')
            ->name('export-excel');

        Route::get('/export-logs', [SubscriptionController::class, 'getExportNotifications'])
            ->name('export-logs');
    });

});
