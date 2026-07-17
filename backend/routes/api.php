<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Tambah route baru ini untuk test sambungan (terbuka kepada semua)
Route::get('/hello', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Mantap! Next.js berjaya berhubung dengan Laravel API.'
    ]);
});


