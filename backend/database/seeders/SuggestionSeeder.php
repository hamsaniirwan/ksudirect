<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuggestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Dapatkan pengguna pertama dalam sistem sebagai pencipta
        $userId = DB::table('users')->first()->id ?? 1;

        // 2. Senarai Bahagian mengikut ID yang tepat
        $divisions = [
            12, // Teknologi Digital
            11, // Pembangunan
            10, // Udara
            9,  // Darat
            4,  // Pengurusan Sumber Manusia
            7   // Perancangan Strategik Dan Antarabangsa
        ];

        // 3. Senarai Kategori & Status
        $categories = ['Kementerian Pengangkutan Malaysia', 'Darat', 'Udara', 'Maritim', 'Hal-hal lain'];
        $statuses = [
            'Draft', 'Baharu', 'Telah Dipanjangkan ke Bahagian', 'Dalam Tindakan', 
            'Dikembalikan', 'Semak Semula', 'Selesai', 'Tiada Tindakan Lanjut'
        ];

        // 4. Perbendaharaan Kata (Kamus) untuk menjana Tajuk & Penerangan secara rawak
        $titlesPart1 = ['Naik taraf', 'Kajian Kesesuaian', 'Cadangan', 'Penambahbaikan', 'Penyelarasan', 'Pendigitalan', 'Semakan Semula', 'Peluasan', 'Pengenalan', 'Penguatkuasaan'];
        $titlesPart2 = ['Sistem', 'Fasiliti', 'Polisi', 'Infrastruktur', 'Garis Panduan', 'Prosedur Operasi Standard (SOP)', 'Aplikasi', 'Laluan', 'Peraturan', 'Kemudahan'];
        $titlesPart3 = ['Pengangkutan Awam', 'Keselamatan Jalan Raya', 'Penerbangan Domestik', 'Industri Maritim', 'Perkhidmatan Rel', 'Staf Kumpulan Sokongan', 'Kenderaan Elektrik (EV)', 'Pengurusan Trafik', 'Kargo Pelabuhan', 'Logistik Negara'];

        $descriptions = [
            'Mohon pihak kementerian mempertimbangkan cadangan ini demi kesejahteraan awam dan kelancaran operasi sektor pengangkutan negara.',
            'Terdapat banyak aduan awam dan kekangan operasi mengenai isu ini. Ia perlu diatasi dengan segera melalui penyelarasan jabatan.',
            'Selaras dengan dasar pendigitalan kerajaan, inisiatif ini diharap dapat meningkatkan kecekapan kementerian dalam memberikan perkhidmatan.',
            'Kajian mendalam perlu dilakukan bersama pihak agensi bagi mengelakkan pertindihan bidang kuasa dan melancarkan aliran kerja (workflow).',
            'Cadangan ini adalah hasil maklum balas daripada pemain industri yang menggesa agar kemudahan ini diselaraskan mengikut standard antarabangsa.',
            'Kementerian perlu mengambil langkah proaktif dalam menyelesaikan kemelut ini bagi mengurangkan kos penyelenggaraan dalam jangka masa panjang.'
        ];

        $dataToInsert = [];
        $counters = [
            2025 => 1,
            2026 => 1
        ];

        // ==========================================
        // PENJANAAN UNTUK TAHUN 2025 (1000 Rekod)
        // ==========================================
        for ($i = 0; $i < 1000; $i++) {
            $month = rand(1, 12);
            $day = rand(1, 28);
            $hour = rand(8, 17);
            
            $createdAt = Carbon::create(2025, $month, $day, $hour, 0, 0);
            $updatedAt = $createdAt->copy()->addDays(rand(1, 14));

            $status = $statuses[array_rand($statuses)];
            $category = $categories[array_rand($categories)];
            
            // Logik Division: Kalau Draft, Baharu, Tiada Tindakan Lanjut -> Tiada division
            $division_id = null;
            if (!in_array($status, ['Draft', 'Baharu', 'Tiada Tindakan Lanjut'])) {
                $division_id = $divisions[array_rand($divisions)];
            }

            $refNo = null;
            if ($status !== 'Draft') {
                $sequence = str_pad($counters[2025]++, 4, '0', STR_PAD_LEFT);
                $refNo = "KSU-2025-{$sequence}";
            }

            $tajuk = $titlesPart1[array_rand($titlesPart1)] . ' ' . $titlesPart2[array_rand($titlesPart2)] . ' ' . $titlesPart3[array_rand($titlesPart3)];
            $penerangan = $descriptions[array_rand($descriptions)];

            $dataToInsert[] = [
                'user_id' => $userId, 
                'division_id' => $division_id,
                'reference_no' => $refNo,
                'category' => $category,
                'title' => $tajuk,
                'description' => $penerangan,
                'attachment' => null, 
                'status' => $status,
                'created_at' => $createdAt->format('Y-m-d H:i:s'),
                'updated_at' => $updatedAt->format('Y-m-d H:i:s'),
            ];
        }

        // ==========================================
        // PENJANAAN UNTUK TAHUN 2026 (Hingga Julai - 300 Rekod)
        // ==========================================
        for ($i = 0; $i < 300; $i++) {
            $month = rand(1, 7); // Jan hingga Julai sahaja
            $day = rand(1, 28);
            $hour = rand(8, 17);
            
            $createdAt = Carbon::create(2026, $month, $day, $hour, 0, 0);
            $updatedAt = $createdAt->copy()->addDays(rand(1, 10));

            $status = $statuses[array_rand($statuses)];
            $category = $categories[array_rand($categories)];
            
            // Logik Division
            $division_id = null;
            if (!in_array($status, ['Draft', 'Baharu', 'Tiada Tindakan Lanjut'])) {
                $division_id = $divisions[array_rand($divisions)];
            }

            $refNo = null;
            if ($status !== 'Draft') {
                $sequence = str_pad($counters[2026]++, 4, '0', STR_PAD_LEFT);
                $refNo = "KSU-2026-{$sequence}";
            }

            $tajuk = $titlesPart1[array_rand($titlesPart1)] . ' ' . $titlesPart2[array_rand($titlesPart2)] . ' ' . $titlesPart3[array_rand($titlesPart3)];
            $penerangan = $descriptions[array_rand($descriptions)];

            $dataToInsert[] = [
                'user_id' => $userId, 
                'division_id' => $division_id,
                'reference_no' => $refNo,
                'category' => $category,
                'title' => $tajuk,
                'description' => $penerangan,
                'attachment' => null, 
                'status' => $status,
                'created_at' => $createdAt->format('Y-m-d H:i:s'),
                'updated_at' => $updatedAt->format('Y-m-d H:i:s'),
            ];
        }

        // ==========================================
        // PROSES KEMASUKAN DATA (BATCH INSERT)
        // ==========================================
        // Kita pecahkan kepada kumpulan 500 rekod supaya pangkalan data tak terbeban/crash
        $chunks = array_chunk($dataToInsert, 500);
        
        foreach ($chunks as $chunk) {
            DB::table('suggestions')->insert($chunk);
        }

        $this->command->info('1,300 data cadangan berskala besar (2025 & Julai 2026) berjaya di-seeding!');
    }
}