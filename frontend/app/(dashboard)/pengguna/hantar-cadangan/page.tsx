"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HantarCadangan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isDraftAction, setIsDraftAction] = useState(false);
  
  // Form State
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Live Word Counter Logic
  const wordCount = description.trim().split(/\s+/).filter((word) => word.length > 0).length;
  const isOverLimit = wordCount > 100;

  // Fungsi halang taip lebih 100 perkataan
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    const words = inputText.trim().split(/\s+/).filter((word) => word.length > 0);

    if (words.length <= 100) {
      setDescription(inputText); // Benarkan jika 100 atau kurang
    } else {
      // Jika melebihi 100 (cth: Copy Paste panjang), potong supaya ngam 100 perkataan
      const truncatedText = words.slice(0, 100).join(" ");
      setDescription(truncatedText);
    }
  };

  // Fungsi untuk buka modal selepas validasi
  const triggerConfirmation = (isDraft: boolean) => {
    if (isOverLimit) {
      setErrorMsg("Penerangan tidak boleh melebihi 100 patah perkataan.");
      return;
    }
    if (!category || !title || !description) {
      setErrorMsg("Sila lengkapkan semua ruang yang diwajibkan.");
      return;
    }

    // Jika semua okey, buka modal dan simpan memori butang mana yang ditekan
    setErrorMsg("");
    setIsDraftAction(isDraft);
    setShowModal(true);
  };

  // Fungsi submit sebenar bila butang "Ya" ditekan
  const handleConfirm = async () => {
    setShowModal(false); // Tutup modal
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("is_draft", isDraftAction ? "1" : "0");
      if (file) formData.append("attachment", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Gagal menyimpan rekod.");
      } else {
        router.push("/pengguna/semak-cadangan");
      }
    } catch (err) {
      setErrorMsg("Berlaku ralat sistem. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 mx-auto relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Hantar Cadangan Baharu</h1>
        <p className="mt-1 text-slate-500">Sila isi butiran cadangan anda di bawah.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Penyampaian perkhidmatan">Penyampaian Perkhidmatan</option>
              <option value="Kompetensi pegawai">Kompetensi Pegawai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tajuk Cadangan <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan tajuk ringkas"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Penerangan / Justifikasi <span className="text-red-500">*</span></label>
              <span className={`text-xs font-bold ${isOverLimit ? "text-red-600" : "text-slate-500"}`}>
                {wordCount} / 100 Patah Perkataan
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Terangkan cadangan anda di sini..."
              className={`w-full rounded-lg border px-4 py-3 text-slate-800 outline-none transition-colors ${
                isOverLimit ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73]"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lampiran Dokumen <span className="text-slate-400 font-normal">(Pilihan - Maksimum 20MB)</span></label>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.jpg,.png"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#003B73] hover:file:bg-blue-100 transition-all"
            />
          </div>

        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end border-t border-slate-100 pt-6">
          <button
            onClick={() => triggerConfirmation(true)}
            disabled={loading || isOverLimit}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Simpan Sebagai Draf
          </button>
          <button
            onClick={() => triggerConfirmation(false)}
            disabled={loading || isOverLimit}
            className="rounded-lg bg-[#003B73] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#002f5c] transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Hantar Cadangan"}
          </button>
        </div>
      </div>

      {/* Pop Up Modal Pengesahan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
            
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-[#003B73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Adakah anda pasti?</h3>
            <p className="text-sm text-slate-500 mb-6">
              {isDraftAction 
                ? "Cadangan ini akan disimpan ke dalam senarai Draf anda." 
                : "Cadangan ini akan dihantar secara rasmi kepada Pejabat KSU."}
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kembali
              </button>
              <button 
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-[#003B73] text-white font-semibold rounded-xl hover:bg-[#002f5c] shadow-md transition-colors"
              >
                Ya, Teruskan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}