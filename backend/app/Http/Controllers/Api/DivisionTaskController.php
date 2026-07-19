<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\AuditTrail;
use App\Models\User; // <-- Wajib tambah untuk query email pengguna
use Illuminate\Support\Facades\DB;
use App\Jobs\SendEmailJob; // <-- Job Emel Latar Belakang
use App\Mail\SuggestionNotificationMail; // <-- Templat Mailable

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

        $tasks = Suggestion::with('user')
            ->where('division_id', $user->division_id)
            ->whereIn('status', ['Telah Dipanjangkan', 'Dalam Tindakan', 'Selesai', 'Ditutup'])
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
        $request->validate([
            'status' => 'required|in:Dalam Tindakan,Selesai,Ditutup',
            'remarks' => 'required|string'
        ]);

        $user = $request->user();
        // Guna with(['user', 'division']) supaya kita boleh akses nama division & email pengirim nanti
        $task = Suggestion::with(['user', 'division'])->where('division_id', $user->division_id)->findOrFail($id);
        $oldStatus = $task->status;

        DB::transaction(function () use ($request, $task, $oldStatus, $user) {
            $task->status = $request->status;
            $task->save();

            // Rekod Audit (FR-012)
            AuditTrail::create([
                'suggestion_id' => $task->id,
                'user_id' => $user->id,
                'action' => 'Kemas Kini Status Tindakan',
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'remarks' => $request->remarks,
            ]);
        });

        // ---------------------------------------------------------
        // MODUL 5: PENCETUS E-MEL JIKA STATUS "SELESAI"
        // ---------------------------------------------------------
        if ($request->status === 'Selesai') {
            
            $divisionName = $task->division->name ?? 'Bahagian yang berkaitan';
            
            // 1. E-mel kepada Pejabat KSU
            $ksuSubject = "KSU Direct - Maklum Balas Selesai ($task->reference_no)";
            $ksuBody = "Tindakan bagi cadangan penambahbaikan bernombor rujukan $task->reference_no telah diselesaikan oleh pihak $divisionName. Ulasan tindakan: " . $request->remarks;
            $ksuLink = env('FRONTEND_URL', 'http://localhost:3000') . "/admin/peti-masuk/{$task->id}";

            // Dapatkan semua staf Pejabat KSU untuk terima notifikasi ini
            $ksuOfficers = User::whereIn('role', ['special_officer', 'ksu'])->get();
            foreach ($ksuOfficers as $officer) {
                SendEmailJob::dispatch($officer->email, new SuggestionNotificationMail($ksuSubject, $ksuBody, $ksuLink));
            }

            // 2. E-mel kepada Pengguna (Penghantar Cadangan)
            $userSubject = "KSU Direct - Cadangan Anda Telah Diselesaikan";
            $userBody = "Cadangan anda bernombor rujukan $task->reference_no telah diambil tindakan dan diselesaikan. Ulasan maklum balas: " . $request->remarks;
            $userLink = env('FRONTEND_URL', 'http://localhost:3000') . "/pengguna/semak-cadangan";
            
            if ($task->user && $task->user->email) {
                SendEmailJob::dispatch($task->user->email, new SuggestionNotificationMail($userSubject, $userBody, $userLink));
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Status tindakan berjaya dikemas kini.']);
    }
}