<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\AuditTrail;
use App\Models\User; 
use Illuminate\Support\Facades\DB;
use App\Jobs\SendEmailJob; 
use App\Mail\SuggestionNotificationMail; 

class DivisionTaskController extends Controller
{
    // Papar senarai tugasan yang disalurkan kepada bahagian pengguna ini
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Pastikan pengguna mempunyai bahagian
        if (!$user->division_id) {
            return response()->json(['status' => 'error', 'message' => 'Akaun anda tidak dihubungkan ke mana-mana Bahagian.'], 403);
        }

        // TAMBAHAN: Kita juga benarkan bahagian melihat kes yang telah mereka 'Dikembalikan' sebagai sejarah
        $tasks = Suggestion::with('user')
            ->where('division_id', $user->division_id)
            ->whereIn('status', ['Telah Dipanjangkan', 'Dalam Tindakan', 'Selesai', 'Ditutup', 'Dikembalikan', 'Semak Semula'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['status' => 'success', 'data' => $tasks]);
    }

    // Papar perincian tugasan
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $task = Suggestion::with(['user', 'division'])->where('division_id', $user->division_id)->findOrFail($id);
        $auditTrails = AuditTrail::with('user')->where('suggestion_id', $id)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'task' => $task,
                'audit_trails' => $auditTrails
            ]
        ]);
    }

    // FR-010: Kemas kini status tindakan & Ulasan
    public function updateStatus(Request $request, $id)
    {
        // 1. KEMAS KINI VALIDASI: Masukkan 'Dikembalikan' dan 'Telah Dipanjangkan'
        $request->validate([
            'status' => 'required|in:Telah Dipanjangkan,Dalam Tindakan,Selesai,Ditutup,Dikembalikan',
            'remarks' => 'required|string'
        ]);

        $user = $request->user();
        $task = Suggestion::with(['user', 'division'])->where('division_id', $user->division_id)->findOrFail($id);
        $oldStatus = $task->status;

        DB::transaction(function () use ($request, $task, $oldStatus, $user) {
            
            $task->status = $request->status;
            
            // Nota: Walaupun dikembalikan, kita kekalkan division_id buat masa ini 
            // supaya wujud dalam sejarah mereka, sehinggalah KSU re-assign kepada bahagian baharu.
            $task->save();

            // Set nama tindakan yang lebih jelas untuk Jejak Audit
            $actionText = 'Kemas Kini Status Tindakan';
            if ($request->status === 'Dikembalikan') {
                $actionText = 'Pemulangan Semula Kes (Bukan Bidang Kuasa)';
            } elseif ($request->status === 'Selesai') {
                $actionText = 'Kes Diselesaikan Oleh Bahagian';
            }

            // Rekod Audit (FR-012)
            AuditTrail::create([
                'suggestion_id' => $task->id,
                'user_id' => $user->id,
                'action' => $actionText,
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'remarks' => $request->remarks,
            ]);
        });

        // ---------------------------------------------------------
        // MODUL 5: PENCETUS E-MEL (SELESAI ATAU DIKEMBALIKAN)
        // ---------------------------------------------------------
        $divisionName = $task->division->name ?? 'Bahagian yang berkaitan';

        if ($request->status === 'Selesai') {
            
            // 1. E-mel kepada Pejabat KSU
            $ksuSubject = "KSU Direct - Maklum Balas Selesai ($task->reference_no)";
            $ksuBody = "Tindakan bagi cadangan penambahbaikan bernombor rujukan $task->reference_no telah diselesaikan oleh pihak $divisionName. Ulasan tindakan: " . $request->remarks;
            $ksuLink = env('FRONTEND_URL', 'http://10.25.62.106:3000') . "/admin/peti-masuk/{$task->id}";

            $ksuOfficers = User::whereIn('role', ['special_officer', 'ksu', 'admin'])->get();
            foreach ($ksuOfficers as $officer) {
                SendEmailJob::dispatch($officer->email, new SuggestionNotificationMail($ksuSubject, $ksuBody, $ksuLink));
            }

            // 2. E-mel kepada Pengguna (Penghantar Cadangan)
            $userSubject = "KSU Direct - Cadangan Anda Telah Diselesaikan";
            $userBody = "Cadangan anda bernombor rujukan $task->reference_no telah diambil tindakan dan diselesaikan. Ulasan maklum balas: " . $request->remarks;
            $userLink = env('FRONTEND_URL', 'http://10.25.62.106:3000') . "/pengguna/semak-cadangan";
            
            if ($task->user && $task->user->email) {
                SendEmailJob::dispatch($task->user->email, new SuggestionNotificationMail($userSubject, $userBody, $userLink));
            }
        } 
        
        // JIKA KES DIPULANGKAN KE PEJABAT KSU
        elseif ($request->status === 'Dikembalikan') {
            
            $ksuSubject = "KSU Direct - PERHATIAN: Kes Dikembalikan ($task->reference_no)";
            $ksuBody = "Tindakan bagi cadangan penambahbaikan bernombor rujukan $task->reference_no telah DIKEMBALIKAN oleh $divisionName dengan alasan berikut: \n\n\"" . $request->remarks . "\"\n\nSila log masuk ke sistem untuk memanjangkan kes ini kepada bahagian yang lebih tepat.";
            $ksuLink = env('FRONTEND_URL', 'http://10.25.62.106:3000') . "/admin/peti-masuk/{$task->id}";

            // Dapatkan staf admin/KSU yang menguruskan sistem
            $ksuOfficers = User::whereIn('role', ['special_officer', 'ksu', 'admin'])->get();
            foreach ($ksuOfficers as $officer) {
                SendEmailJob::dispatch($officer->email, new SuggestionNotificationMail($ksuSubject, $ksuBody, $ksuLink));
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Status tindakan berjaya dikemas kini.']);
    }
}