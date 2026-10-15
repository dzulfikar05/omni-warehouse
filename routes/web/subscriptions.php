<?php

use App\Http\Controllers\Admin\SubscriptionController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'role:superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('/subscriptions/create-invoice', [SubscriptionController::class, 'createInvoice'])->name('subscriptions.create-invoice');
    Route::post('/subscriptions/invoices', [SubscriptionController::class, 'storeInvoice'])->name('subscriptions.store-invoice');
});
