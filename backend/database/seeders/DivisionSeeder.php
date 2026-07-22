<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            ['id' => 1, 'name' => 'Pejabat Menteri', 'email' => 'Pejmenteri@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 2, 'name' => 'Pejabat Timbalan Menteri', 'email' => 'pejabattimbmenteri@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 3, 'name' => 'Pejabat Ketua Setiausaha', 'email' => 'pejabatksu@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 4, 'name' => 'Bahagian Pengurusan Sumber Manusia', 'email' => 'BahagianPengurusanSumberManusia@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 5, 'name' => 'Bahagian Pentadbiran', 'email' => 'bahagianpentadbiran@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 6, 'name' => 'Bahagian Akaun', 'email' => 'bahagianakaun@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 7, 'name' => 'Bahagian Perancangan Strategik Dan Antarabangsa', 'email' => 'bpsa@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 8, 'name' => 'Bahagian Maritim', 'email' => 'maritim@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 9, 'name' => 'Bahagian Darat', 'email' => 'bahagiandarat@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 10, 'name' => 'Bahagian Udara', 'email' => 'bhgudara@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 11, 'name' => 'Bahagian Pembangunan', 'email' => 'pemantauanprojek@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 12, 'name' => 'Bahagian Teknologi Digital', 'email' => 'BahagianPengurusanMaklumat@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => 1, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => '2026-04-02 14:24:34'],
            ['id' => 13, 'name' => 'Unit Komunikasi Korporat', 'email' => 'UnitKomunikasiKorporat@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 14, 'name' => 'Unit Penasihat Undang-undang', 'email' => 'PUU@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 15, 'name' => 'Unit Integriti', 'email' => 'UnitIntegriti@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 16, 'name' => 'Unit KPI', 'email' => 'unitKPI@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 17, 'name' => 'Biro Siasatan Kemalangan Udara', 'email' => 'msofri@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => 1, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => '2025-10-07 14:16:20'],
            ['id' => 18, 'name' => 'Unit Audit Dalam', 'email' => 'auditdalam@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 19, 'name' => 'Bahagian Perolehan dan Kewangan', 'email' => 'kewangan@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 20, 'name' => 'Semua Bahagian', 'email' => 'motstaff@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 21, 'name' => 'Jabatan Sukarelawan Malaysia', 'email' => 'rela@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
            ['id' => 22, 'name' => 'Pusat Logistik Negara', 'email' => 'abcdef@mot.gov.my', 'is_deleted' => 0, 'id_pencipta' => 1, 'pengguna' => null, 'created_at' => '2025-05-21 10:36:17', 'updated_at' => null],
        ];

        DB::table('divisions')->insert($divisions);
    }
}