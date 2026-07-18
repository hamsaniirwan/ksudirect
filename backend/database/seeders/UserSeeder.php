<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Division; // Wajib import Model Division

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cipta satu Bahagian (Division) ujian
        $bahagianIT = Division::create([
            'name' => 'Bahagian Pengurusan Maklumat (BPM)'
        ]);

        // 2. Senarai pengguna
        $users = [
            [
                'name' => 'Ahmad (Pegawai MOT)',
                'email' => 'hamsani7@gmail.com',
                //'email' => 'officer@mot.gov.my',
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
                'email' => 'sub@mot.gov.my',
                'password' => Hash::make('password123'),
                'role' => 'division_head',
                'division_id' => $bahagianIT->id, // <-- Pautkan Dr. Kamal ke Bahagian IT
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