"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function KemaskiniCadangan() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  
  // Word count logic
  const wordCount = description.trim() === "" ? 0 : description.trim().split(/\s+/).length;
  const isOverLimit = wordCount > 100;

  useEffect(() => {
    const fetchDraft = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.status === "success") {
          const draft = result.data;
          
          // Halang pengguna masuk jika bukan Draf
          if (draft.status !== "Draft") {
            router.push("/pengguna/semak-cadangan");
            return;
          }

          setCategory(draft.category);
          setTitle(draft.title);
          setDescription(draft.description);
          if (draft.attachment) {
            setExistingFileName(draft.attachment.split('/').pop());
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Gagal memuatkan data draf.");
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [id, router]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!category || !title || !description) {
      setErrorMsg("Sila isi semua ruangan yang wajib.");
      window.scrollTo(0, 0);
      return;
    }
    if (isOverLimit) {
      setErrorMsg("Penerangan tidak boleh melebihi 100 patah perkataan.");
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("is_draft", isDraft ? "1" : "0");
    
    if (attachment) {
      formData.append("attachment", attachment);
    }
    
    // Helah Laravel: Untuk upload fail menggunakan PUT, kita perlu hantar sebagai POST tapi tambah _method = PUT
    formData.append("_method", "PUT"); 

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions/${id}`, {
        method: "POST", // WAJIB POST kerana _method=PUT
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        router.push("/pengguna/semak-cadangan");
      } else {
        setErrorMsg(result.message || "Gagal menyimpan cadangan.");
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ralat sistem. Gagal berhubung dengan pangkalan pelayan.");
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan Draf...</div>;

  return (
    <div className="p-6 md:p-8 mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/pengguna/semak-cadangan/${id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kemaskini Draf</h1>
          <p className="mt-1 text-slate-500">Ubah suai maklumat sebelum dihantar kepada Pejabat KSU.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 shadow-sm flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Cadangan <span className="text-red-500">*</span></label>
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors"
            >
              <option value="">Pilih kategori...</option>
              <option value="Penyampaian perkhidmatan">Penyampaian perkhidmatan</option>
              <option value="Proses kerja">Proses kerja</option>
              <option value="Polisi / Peraturan">Polisi / Peraturan</option>
              <option value="Kebajikan warga MOT">Kebajikan warga MOT</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tajuk Cadangan <span className="text-red-500">*</span></label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pendigitalan Proses Kelulusan Lesen"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73] outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Penerangan / Justifikasi <span className="text-red-500">*</span></label>
              <span className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>{wordCount} / 100 patah perkataan</span>
            </div>
            <textarea 
              rows={6} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Terangkan cadangan anda secara ringkas dan padat..."
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isOverLimit ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:border-[#003B73] focus:ring-1 focus:ring-[#003B73]'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lampiran Tambahan (Pilihan)</label>
            
            {existingFileName && !attachment && (
              <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#003B73] font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  Fail tersimpan: {existingFileName}
                </div>
                <button type="button" onClick={() => setExistingFileName("")} className="text-xs text-red-500 hover:underline">Ganti Fail</button>
              </div>
            )}

            {(!existingFileName || attachment) && (
              <input 
                type="file" ref={fileInputRef}
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                accept=".pdf,.docx,.xlsx,.jpg,.png"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors"
              />
            )}
            <p className="mt-2 text-xs text-slate-400">Format diterima: PDF, DOCX, XLSX, JPG, PNG (Max: 20MB). Memuat naik fail baharu akan menggantikan fail lama.</p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button 
              type="button" disabled={isSubmitting} onClick={() => handleSubmit(true)}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
            >
              Kemaskini & Kekal Draf
            </button>
            <button 
              type="button" disabled={isSubmitting || isOverLimit} onClick={() => handleSubmit(false)}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-[#003B73] hover:bg-[#002f5c] transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Menghantar...</>
              ) : (
                "Hantar Cadangan"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}