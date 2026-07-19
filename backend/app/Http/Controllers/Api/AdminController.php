<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\AuditTrail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendEmailJob; // <-- Job Emel Latar Belakang
use App\Mail\SuggestionNotificationMail; // <-- Templat Mailable

class AdminInboxController extends Controller
{
    // ... (Fungsi index & show kau kekalkan macam biasa) ...

    public function decision(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:panjangkan,abaikan',
            'division_id' => 'required_if:action,panjangkan',
            'remarks' => 'nullable|string'
        ]);

        $user = $request->user();
        $task = Suggestion::findOrFail($id);
        $oldStatus = $task->status;

        DB::transaction(function () use ($request, $task, $oldStatus, $user) {
            
            // Pertukaran Status
            if ($request->action === 'panjangkan') {
                $task->status = 'Telah Dipanjangkan';
                $task->division_id = $request->division_id;
            } else {
                $task->status = 'Ditutup'; // Atau NFA
            }
            $task->save();

            // Rekod Audit Trail
            AuditTrail::create([
                'suggestion_id' => $task->id,
                'user_id' => $user->id,
                'action' => $request->action === 'panjangkan' ? 'Panjangkan ke Bahagian' : 'Tiada Tindakan Lanjut',
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'remarks' => $request->remarks,
            ]);
        });

        // ---------------------------------------------------------
        // MODUL 5: HANTAR E-MEL ARAHAN KEPADA SUB / KETUA UNIT
        // ---------------------------------------------------------
        if ($request->action === 'panjangkan') {
            
            // Cari siapa Ketua Bahagian / SUB untuk division yang dipilih tadi
            $divisionHeads = User::where('role', 'division_head')
                                 ->where('division_id', $request->division_id)
                                 ->get();

            $subject = "KSU Direct - Arahan Tindakan Lanjut Cadangan Penambahbaikan ($task->reference_no)";
            
            // Ayat disalin 100% daripada gambar rajah SOP
            $body = "Adalah dimaklumkan bahawa KSU telah menerima satu cadangan penambahbaikan untuk diteliti. Sila pihak Bahagian/ Unit Ybhg. Datuk/ Dato'/ Dr./ Tuan/ Puan mengambil tindakan sewajarnya berhubung perkara ini. Terima kasih.";
            
            // Link ke Modul Ketua Bahagian
            $link = env('FRONTEND_URL', 'http://localhost:3000') . "/bahagian/tugasan/{$task->id}";

            foreach ($divisionHeads as $head) {
                SendEmailJob::dispatch($head->email, new SuggestionNotificationMail($subject, $body, $link));
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Keputusan berjaya disimpan.']);
    }
}