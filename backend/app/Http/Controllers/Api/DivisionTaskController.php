<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\AuditTrail;
use Illuminate\Support\Facades\DB;

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
        $task = Suggestion::where('division_id', $user->division_id)->findOrFail($id);
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

        // TODO Modul 5: Boleh trigger email kepada Pejabat KSU / Pengguna di sini jika status Selesai

        return response()->json(['status' => 'success', 'message' => 'Status tindakan berjaya dikemas kini.']);
    }
}