<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\SuggestionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DivisionTaskController;
use App\Http\Controllers\Api\AdminInboxController;
// TAMBAH: Import UserController
use App\Http\Controllers\Api\UserController;
use App\Models\Division;

// Laluan Terbuka (Public)
Route::post('/login', [AuthController::class, 'login']);

// Laluan Terlindung (Protected by Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    });

    // --- PASTIKAN SEMUA ROUTE INI DUDUK DI DALAM BLOK MIDDLEWARE INI ---

    // Route Modul Pengguna (Cadangan)
    Route::apiResource('suggestions', SuggestionController::class)->only(['index', 'store', 'show', 'update']);

    // Route Modul Admin
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/inbox', [AdminController::class, 'inbox']);
        Route::get('/inbox/{id}', [AdminController::class, 'show']);
        Route::post('/inbox/{id}/decision', [AdminController::class, 'decision']);
    });

    // Route Modul Bahagian
    Route::prefix('bahagian')->group(function () {
        Route::get('/tasks', [DivisionTaskController::class, 'index']);
        Route::get('/tasks/{id}', [DivisionTaskController::class, 'show']);
        Route::post('/tasks/{id}/status', [DivisionTaskController::class, 'updateStatus']);
    });

    // ==========================================
    // TAMBAHAN BAHARU: Route Pengurusan Pengguna
    // ==========================================
    Route::apiResource('users', UserController::class);

    // TAMBAHAN BAHARU: Route Senarai Bahagian (Untuk Dropdown Modal Pengguna)
    Route::get('/divisions', function () {
        return response()->json([
            'status' => 'success',
            'data' => Division::select('id', 'name')->get()
        ]);
    });

}); // <-- PENUTUP KUMPULAN SANCTUM BERADA DI BAWAH SEKALI