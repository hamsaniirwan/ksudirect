<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Validasi domain MOT (FR-001)
        if (!str_ends_with($request->email, '@mot.gov.my')) {
            throw ValidationException::withMessages([
                'email' => ['Akses ditolak. Sila gunakan e-mel rasmi @mot.gov.my sahaja.'],
            ]);
        }

        // Semak kredensial
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Maklumat log masuk tidak tepat.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // Padam token lama (opsyenal, untuk pastikan 1 sesi aktif sahaja jika perlu)
        $user->tokens()->delete();

        // Jana token baharu
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Log masuk berjaya.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Log keluar berjaya.'
        ]);
    }
}