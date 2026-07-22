<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Division;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cari Bahagian Teknologi Digital dari database 
        // (Pastikan DivisionSeeder dijalankan sebelum UserSeeder)
        $bahagianIT = Division::where('name', 'Bahagian Teknologi Digital')->first();

        // 2. Senarai pengguna (Kekalkan emel untuk ujian)
        $users = [
            [
                'name' => 'Ahmad (Pegawai MOT)',
                'email' => 'officer@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'division_id' => null,
            ],
            [
                'name' => 'Siti (Pegawai Khas KSU)',
                'email' => 'hamsani@mot.gov.my',
                //'email' => 'pegawaikhas@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'special_officer',
                'division_id' => null,
            ],
            [
                'name' => 'Dato KSU',
                'email' => 'hamsaniazbzforce@gmail.com',
                //'email' => 'ksu@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'ksu',
                'division_id' => null,
            ],
            [
                'name' => 'Dr. Kamal (Ketua Bahagian)',
                'email' => 'hamsani7@gmail.com',
                //'email' => 'sub@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'division_head',
                // Pautkan Dr. Kamal ke Bahagian Teknologi Digital (ID 12)
                'division_id' => $bahagianIT ? $bahagianIT->id : 12, 
            ],
            [
                'name' => 'Pentadbir Sistem',
                'email' => 'admin@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'division_id' => null,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}