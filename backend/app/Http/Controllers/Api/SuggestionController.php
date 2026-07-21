<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\SendEmailJob;
use App\Mail\SuggestionNotificationMail;
use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SuggestionController extends Controller
{
    // Papar senarai cadangan milik pengguna log masuk
    public function index(Request $request)
    {
        $suggestions = Suggestion::where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['status' => 'success', 'data' => $suggestions]);
    }

    // Simpan Draf atau Hantar Terus
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,docx,xlsx,jpg,png|max:20480', // Max 20MB
            'is_draft' => 'required|boolean'
        ]);

        // Validasi Backend: Maksimum 100 patah perkataan
        if (str_word_count($request->description) > 100) {
            throw ValidationException::withMessages([
                'description' => ['Penerangan tidak boleh melebihi 100 patah perkataan.']
            ]);
        }

        $data = $request->only(['category', 'title', 'description']);
        $data['user_id'] = $request->user()->id;
        $data['status'] = $request->is_draft ? 'Draft' : 'Belum Diteliti';

        // Jana Nombor Rujukan jika dihantar (Bukan draf)
        if (!$request->is_draft) {
            $data['reference_no'] = $this->generateReferenceNumber();
        }

        // TUKAR LOGIK UPLOAD FAIL DI SINI
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $extension = $file->getClientOriginalExtension(); // Dapatkan format fail (cth: pdf, docx)
            
            // Tetapkan nama fail berdasarkan status
            if (isset($data['reference_no'])) {
                // Jika ada no rujukan: KSU-2026-0001.pdf
                $filename = $data['reference_no'] . '.' . $extension;
            } else {
                // Jika masih draf: DRAF_1700000000.pdf
                $filename = 'DRAF_' . time() . '.' . $extension;
            }

            // Simpan fail menggunakan nama yang telah ditetapkan
            $data['attachment'] = $file->storeAs('attachments', $filename, 'public');
        }

        $suggestion = Suggestion::create($data);

        // Modul 5: Trigger Email Event di sini jika status = 'Belum Diteliti'
        if (!$request->is_draft) {
            // 1. Emel kepada Penghantar (Submitter)
            $submitterSubject = "KSU Direct - Status Penghantaran";
            $submitterBody = "Cadangan anda ({$suggestion->reference_no}) telah diterima dan dikemukakan kepada Pejabat Ketua Setiausaha.";
            SendEmailJob::dispatch($request->user()->email, new SuggestionNotificationMail($submitterSubject, $submitterBody));

            // 2. Emel kepada Pejabat KSU
            $ksuSubject = "KSU Direct - Cadangan Baharu Diterima";
            $ksuBody = "KSU telah menerima satu cadangan penambahbaikan baharu ({$suggestion->reference_no}) untuk diteliti.";
            $ksuLink = env('FRONTEND_URL', 'http://localhost:3000') . "/admin/peti-masuk/{$suggestion->id}";
            
            // Cari semua user yang memegang role Pejabat KSU (contoh: special_officer)
            $ksuOfficers = User::whereIn('role', ['special_officer', 'ksu'])->get();
            foreach ($ksuOfficers as $officer) {
                SendEmailJob::dispatch($officer->email, new SuggestionNotificationMail($ksuSubject, $ksuBody, $ksuLink));
            }
        }
        
        return response()->json([
            'status' => 'success',
            'message' => $request->is_draft ? 'Draf berjaya disimpan.' : 'Cadangan berjaya dihantar.',
            'data' => $suggestion
        ]);
    }

    // Papar perincian cadangan
    public function show(Request $request, $id)
    {
        $suggestion = Suggestion::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $suggestion]);
    }

    // Fungsi Dalaman: Jana Nombor Rujukan (FR-004)
    private function generateReferenceNumber()
    {
        $year = date('Y');
        $lastRecord = Suggestion::whereYear('created_at', $year)
            ->whereNotNull('reference_no')
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastRecord ? intval(substr($lastRecord->reference_no, -4)) + 1 : 1;
        return 'KSU-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // ====================================================================
    // TAMBAHKAN FUNGSI INI UNTUK MENGEMASKINI DRAF
    // ====================================================================
    public function update(Request $request, $id)
    {
        $suggestion = Suggestion::where('user_id', $request->user()->id)->findOrFail($id);

        // Pastikan HANYA status Draft sahaja yang boleh dikemaskini
        if ($suggestion->status !== 'Draft') {
            return response()->json(['status' => 'error', 'message' => 'Hanya draf yang boleh dikemaskini.'], 403);
        }

        $request->validate([
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,docx,xlsx,jpg,png|max:20480',
            'is_draft' => 'required|boolean'
        ]);

        if (str_word_count($request->description) > 100) {
            throw ValidationException::withMessages([
                'description' => ['Penerangan tidak boleh melebihi 100 patah perkataan.']
            ]);
        }

        $suggestion->category = $request->category;
        $suggestion->title = $request->title;
        $suggestion->description = $request->description;

        // Jika butang "Hantar" ditekan (Bukan lagi draf)
        if (!$request->is_draft) {
            $suggestion->status = 'Belum Diteliti';
            $suggestion->reference_no = $this->generateReferenceNumber();
        }

        // Pengurusan Fail Lampiran
        if ($request->hasFile('attachment')) {
            // Padam fail lama jika wujud
            if ($suggestion->attachment && Storage::disk('public')->exists($suggestion->attachment)) {
                Storage::disk('public')->delete($suggestion->attachment);
            }

            $file = $request->file('attachment');
            $extension = $file->getClientOriginalExtension();
            
            $filename = isset($suggestion->reference_no) 
                ? $suggestion->reference_no . '.' . $extension 
                : 'DRAF_' . time() . '.' . $extension;

            $suggestion->attachment = $file->storeAs('attachments', $filename, 'public');
        } 
        // Jika pengguna hantar draf sedia ada yang dah ada fail, tukar nama fail lama itu ke No Rujukan rasmi
        else if (!$request->is_draft && $suggestion->attachment) {
             $oldPath = $suggestion->attachment;
             $extension = pathinfo($oldPath, PATHINFO_EXTENSION);
             $newName = 'attachments/' . $suggestion->reference_no . '.' . $extension;
             
             if (Storage::disk('public')->exists($oldPath)) {
                 Storage::disk('public')->move($oldPath, $newName);
                 $suggestion->attachment = $newName;
             }
        }

        $suggestion->save();

        // Trigger Email jika draf akhirnya dihantar
        if (!$request->is_draft) {
            $submitterSubject = "KSU Direct - Status Penghantaran";
            $submitterBody = "Cadangan anda ({$suggestion->reference_no}) telah diterima dan dikemukakan kepada Pejabat Ketua Setiausaha.";
            SendEmailJob::dispatch($request->user()->email, new SuggestionNotificationMail($submitterSubject, $submitterBody));

            $ksuSubject = "KSU Direct - Cadangan Baharu Diterima";
            $ksuBody = "KSU telah menerima satu cadangan penambahbaikan baharu ({$suggestion->reference_no}) untuk diteliti.";
            $ksuLink = env('FRONTEND_URL', 'http://10.25.62.106:3000') . "/admin/peti-masuk/{$suggestion->id}";
            
            $ksuOfficers = User::whereIn('role', ['special_officer', 'ksu'])->get();
            foreach ($ksuOfficers as $officer) {
                SendEmailJob::dispatch($officer->email, new SuggestionNotificationMail($ksuSubject, $ksuBody, $ksuLink));
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => $request->is_draft ? 'Draf berjaya dikemaskini.' : 'Cadangan berjaya dihantar.',
            'data' => $suggestion
        ]);
    }
}