<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\Division;
use App\Models\AuditTrail;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // FR-011: Dashboard Metrik
    public function dashboard(Request $request)
    {
        $total = Suggestion::where('status', '!=', 'Draft')->count();
        $pending = Suggestion::where('status', 'Belum Diteliti')->count();
        $forwarded = Suggestion::where('status', 'Telah Dipanjangkan')->count();
        $completed = Suggestion::where('status', 'Selesai')->count();

        // Carta Pai (Pecahan Kategori)
        $categoryBreakdown = Suggestion::select('category', DB::raw('count(*) as total'))
            ->where('status', '!=', 'Draft')
            ->groupBy('category')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'kpi' => compact('total', 'pending', 'forwarded', 'completed'),
                'charts' => ['kategori' => $categoryBreakdown]
            ]
        ]);
    }

    // FR-006: Peti Masuk (Senarai) & FR-007 (Boleh guna parameter query untuk filter)
    public function inbox(Request $request)
    {
        $query = Suggestion::with('user', 'division')->where('status', '!=', 'Draft');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $suggestions = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $suggestions]);
    }

    // Papar Perincian, Jejak Audit & Senarai Bahagian
    public function show($id)
    {
        $suggestion = Suggestion::with(['user', 'division'])->findOrFail($id);
        $auditTrails = AuditTrail::with('user')->where('suggestion_id', $id)->orderBy('created_at', 'desc')->get();
        $divisions = Division::all();

        return response()->json([
            'status' => 'success', 
            'data' => [
                'suggestion' => $suggestion,
                'audit_trails' => $auditTrails,
                'divisions' => $divisions
            ]
        ]);
    }

    // FR-008 & FR-012: Pembuatan Keputusan & Jejak Audit
    public function decision(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:panjangkan,abaikan',
            'division_id' => 'required_if:action,panjangkan|exists:divisions,id|nullable'
        ]);

        $suggestion = Suggestion::findOrFail($id);
        $oldStatus = $suggestion->status;

        DB::transaction(function () use ($request, $suggestion, $oldStatus) {
            if ($request->action === 'panjangkan') {
                $suggestion->status = 'Telah Dipanjangkan';
                $suggestion->division_id = $request->division_id;
                $actionName = 'Dipanjangkan ke Bahagian';
            } else {
                $suggestion->status = 'Tiada Keperluan Tindakan Lanjut';
                $actionName = 'Tindakan Diabaikan (NFA)';
            }
            $suggestion->save();

            // Rekod Audit (FR-012)
            AuditTrail::create([
                'suggestion_id' => $suggestion->id,
                'user_id' => $request->user()->id,
                'action' => $actionName,
                'old_status' => $oldStatus,
                'new_status' => $suggestion->status,
                'remarks' => $request->remarks ?? null,
            ]);
        });

        // TODO untuk Modul 5: Trigger Email kepada Division Head di sini

        return response()->json(['status' => 'success', 'message' => 'Tindakan berjaya direkodkan.']);
    }
}