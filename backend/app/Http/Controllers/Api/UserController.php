<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // 1. Senarai semua pengguna
    public function index(Request $request)
    {
        // Panggil pengguna beserta nama bahagian (jika ada)
        $users = User::with('division')->latest()->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }

    // 2. Tambah pengguna (Pre-provisioning) oleh Admin
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => ['required', Rule::in(['user', 'admin', 'ksu', 'special_officer', 'division_head'])],
            'division_id' => 'required_if:role,division_head|nullable|exists:divisions,id'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            // Letak password rawak sekadar untuk penuhi syarat DB. SSO yang akan urus password sebenar.
            'password' => Hash::make(Str::random(24)), 
            'division_id' => $request->role === 'division_head' ? $request->division_id : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berjaya ditambah.',
            'data' => $user
        ]);
    }

    // 3. Kemaskini peranan/bahagian pengguna
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['user', 'admin', 'ksu', 'special_officer', 'division_head'])],
            'division_id' => 'required_if:role,division_head|nullable|exists:divisions,id'
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->division_id = $request->role === 'division_head' ? $request->division_id : null;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Maklumat pengguna berjaya dikemaskini.',
            'data' => $user
        ]);
    }

    // 4. Padam Pengguna
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Elak admin padam diri sendiri
        if (request()->user()->id === $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Anda tidak boleh memadam akaun anda sendiri.'], 403);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berjaya dipadam.'
        ]);
    }
}