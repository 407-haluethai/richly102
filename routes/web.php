<?php

use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');


Route::get('/', function () {
    return Inertia::render('Home');
})->name('home'); // ✅ กำหนดให้ Home เป็นหน้าหลัก


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/transactions/add', fn () => Inertia::render('AddTransaction'))->name('transactions.add');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions', [TransactionController::class, 'index']);
});

Route::put('/transactions/{id}', [TransactionController::class, 'update']);
Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
Route::get('/transactions/{id}', [TransactionController::class, 'show']);

Route::middleware(['auth'])->group(function () {
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
});

require __DIR__.'/auth.php';
