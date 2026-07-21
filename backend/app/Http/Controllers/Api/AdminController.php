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

class AdminController extends Controller
{
    // =========================================================
    // FUNGSI UNTUK SENARAI PETI MASUK (API)
    // =========================================================
    public function inbox(Request $request)
    {
        $suggestions = Suggestion::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $suggestions
        ]);
    }

    // =========================================================
    // FUNGSI UNTUK PAPAR SATU CADANGAN (Bila butang 'Semak' ditekan)
    // =========================================================
    public function show($id)
    {
        $suggestion = Suggestion::with(['user:id,name', 'auditTrails.user:id,name'])->find($id);

        if (!$suggestion) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cadangan tidak dijumpai'
            ], 404);
        }

        $divisions = \App\Models\Division::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'suggestion' => $suggestion,
                'audit_trails' => $suggestion->auditTrails,
                'divisions' => $divisions
            ]
        ]);
    }

    // =========================================================
    // FUNGSI UNTUK KEPUTUSAN KSU
    // =========================================================
    public function decision(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:panjangkan,abaikan,buka_semula',
            'division_id' => 'required_if:action,panjangkan',
            'remarks' => 'required_if:action,buka_semula|nullable|string' 
        ]);

        $user = $request->user();
        $task = Suggestion::findOrFail($id);
        $oldStatus = $task->status;

        DB::transaction(function () use ($request, $task, $oldStatus, $user) {
            
            if ($request->action === 'panjangkan') {
                $task->status = 'Telah Dipanjangkan';
                $task->division_id = $request->division_id;
            } elseif ($request->action === 'buka_semula') {
                $task->status = 'Semak Semula';
            } else {
                $task->status = 'Ditutup'; 
            }
            $task->save();

            $actionText = '';
            if ($request->action === 'panjangkan') {
                $actionText = 'Panjangkan ke Bahagian';
            } elseif ($request->action === 'buka_semula') {
                $actionText = 'Buka Semula Cadangan';
            } else {
                $actionText = 'Tiada Tindakan Lanjut';
            }

            AuditTrail::create([
                'suggestion_id' => $task->id,
                'user_id' => $user->id,
                'action' => $actionText,
                'old_status' => $oldStatus,
                'new_status' => $task->status,
                'remarks' => $request->remarks,
            ]);
        });

        if ($request->action === 'panjangkan' || $request->action === 'buka_semula') {
            
            $targetDivisionId = $request->action === 'panjangkan' ? $request->division_id : $task->division_id;

            $divisionHeads = User::where('role', 'division_head')
                                 ->where('division_id', $targetDivisionId)
                                 ->get();

            $subject = "KSU Direct - Arahan Tindakan Lanjut Cadangan Penambahbaikan ($task->reference_no)";
            
            if ($request->action === 'buka_semula') {
                $body = "Adalah dimaklumkan bahawa Pejabat KSU telah MEMBUKA SEMULA cadangan ini untuk disemak kembali. Sila teliti ulasan yang diberikan oleh pihak pengurusan dan ambil tindakan sewajarnya. Terima kasih.";
            } else {
                $body = "Adalah dimaklumkan bahawa KSU telah menerima satu cadangan penambahbaikan untuk diteliti. Sila pihak Bahagian/ Unit Ybhg. Datuk/ Dato'/ Dr./ Tuan/ Puan mengambil tindakan sewajarnya berhubung perkara ini. Terima kasih.";
            }
            
            $link = env('FRONTEND_URL', 'http://10.25.62.106:3000') . "/bahagian/tugasan/{$task->id}";

            foreach ($divisionHeads as $head) {
                SendEmailJob::dispatch($head->email, new SuggestionNotificationMail($subject, $body, $link));
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Keputusan berjaya disimpan.']);
    }

    // =========================================================
    // FUNGSI UNTUK DASHBOARD ADMIN (CARTA & KPI)
    // =========================================================
    public function dashboard(Request $request)
    {
        // 1. KIRAAN KPI UTAMA (Atas)
        $total = Suggestion::count();
        $pending = Suggestion::whereIn('status', ['Belum Diteliti'])->count(); 
        $forwarded = Suggestion::whereIn('status', ['Telah Dipanjangkan', 'Dalam Tindakan', 'Semak Semula', 'Dikembalikan'])->count();
        $completed = Suggestion::whereIn('status', ['Selesai', 'Ditutup', 'Tiada Keperluan Tindakan Lanjut'])->count();

        // 2. GRAF KESELURUHAN MENGIKUT TAHUN (Kalis Ralat DB)
        $allSuggestions = Suggestion::all();
        $yearlyData = $allSuggestions->groupBy(function($item) {
            return \Carbon\Carbon::parse($item->created_at)->format('Y');
        })->map(function($group, $year) {
            return [
                'year' => (string) $year,
                'total' => $group->count()
            ];
        })->values()->sortBy('year')->toArray();

        // 3. GRAF BULANAN MENGIKUT STATUS (Kalis Ralat DB)
        $selectedYear = $request->input('year', date('Y')); // Jika kosong, guna tahun semasa
        $suggestionsThisYear = Suggestion::whereYear('created_at', $selectedYear)->get();
        
        $bulanMelayu = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mac', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Ogo', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Dis'
        ];

        $monthlyData = [];
        // Loop 12 bulan supaya graf sentiasa penuh 12 bar (Jan-Dis)
        for ($i = 1; $i <= 12; $i++) {
            // Tapis data untuk bulan tersebut sahaja
            $monthItems = $suggestionsThisYear->filter(function($item) use ($i) {
                return \Carbon\Carbon::parse($item->created_at)->format('n') == $i;
            });

            $monthlyData[] = [
                'month' => $bulanMelayu[$i],
                'pending' => $monthItems->where('status', 'Belum Diteliti')->count(),
                'forwarded' => $monthItems->whereIn('status', ['Telah Dipanjangkan', 'Dalam Tindakan', 'Semak Semula', 'Dikembalikan'])->count(),
                'completed' => $monthItems->whereIn('status', ['Selesai', 'Ditutup', 'Tiada Keperluan Tindakan Lanjut'])->count(),
            ];
        }

        // 4. GRAF PRESTASI MENGIKUT BAHAGIAN (Top 5 Paling Banyak)
        $divisionData = DB::table('suggestions')
            ->join('divisions', 'suggestions.division_id', '=', 'divisions.id')
            ->select('divisions.name', DB::raw('count(suggestions.id) as total'))
            ->whereNotNull('suggestions.division_id')
            ->groupBy('divisions.id', 'divisions.name')
            ->orderByDesc('total')
            ->limit(5) 
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'kpi' => [
                    'total' => $total,
                    'pending' => $pending,
                    'forwarded' => $forwarded,
                    'completed' => $completed
                ],
                'charts' => [
                    'yearlyData' => array_values($yearlyData),
                    'monthlyData' => $monthlyData,
                    'divisionData' => $divisionData
                ]
            ]
        ]);
    }
}