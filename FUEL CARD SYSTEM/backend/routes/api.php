<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminCardController;

// POST /api/login
Route::post('/login', [AuthController::class, 'login']);

// GET /api/cards/{card_id}/status
Route::get('/cards/{card_id}/status', [CardController::class, 'status']);

// Protected Admin Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/transactions/process', [TransactionController::class, 'process']);
});

use App\Http\Middleware\SuperAdminMiddleware;

// Protected Super Admin Routes
Route::middleware(['auth:sanctum', SuperAdminMiddleware::class])->group(function () {
    Route::get('/super-admin/admins', [SuperAdminController::class, 'index']);
    Route::post('/super-admin/admins', [SuperAdminController::class, 'store']);
    Route::delete('/super-admin/admins/{admin}', [SuperAdminController::class, 'destroy']);

    // Super Admin Card Management
    Route::get('/super-admin/cards', [SuperAdminCardController::class, 'index']);
    Route::post('/super-admin/cards', [SuperAdminCardController::class, 'store']);
    Route::delete('/super-admin/cards/{card_id}', [SuperAdminCardController::class, 'destroy']);
});

