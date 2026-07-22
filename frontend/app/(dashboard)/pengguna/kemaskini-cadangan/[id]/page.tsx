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
  const [status, setStatus] = useState(""); // <-- TAMBAH STATE STATUS
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState("");

  // Word count logic
  const wordCount = description.trim() === "" ? 0 : description.trim().split(/\s+/).length;
  const isOverLimit = wordCount > 100;
  
  // Logik adakah ia dah dihantar atau belum
  const isAlreadySubmitted = status !== "" && status !== "Draft";

  useEffect(() => {
    const fetchDraft = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (result.status === "success") {
          const draft = result.data;

          // LOGIK BARU: Halang pengguna masuk JIKA HANYA status dah Selesai/Ditutup
          if (["Selesai", "Ditutup", "Tiada Keperluan Tindakan Lanjut"].includes(draft.status)) {
            router.push("/pengguna/semak-cadangan");
            return;
          }

          setStatus(draft.status);
          setCategory(draft.category);
          setTitle(draft.title);
          setDescription(draft.description);
          if (draft.attachment) {
            setExistingFileName(draft.attachment.split("/").pop());
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
    
    // Jika ia dah dihantar (bukan draf), pastikan is_draft kekal 0
    formData.append("is_draft", isAlreadySubmitted ? "0" : (isDraft ? "1" : "0"));

    if (attachment) {
      formData.append("attachment", attachment);
    }

    // Helah Laravel: Untuk upload fail menggunakan PUT, kita perlu hantar sebagai POST tapi tambah _method = PUT
    formData.append("_method", "PUT");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions/${id}`, {
        method: "POST", // WAJIB POST kerana _method=PUT
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        router.push(`/pengguna/semak-cadangan/${id}`);
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

  if (loading)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-body">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A1F3D] border-t-transparent shadow-sm"></div>
        <p className="mt-4 text-sm font-medium text-[#64748B]">Memuatkan borang...</p>
      </div>
    );

  return (
    <div className="mx-auto p-4 font-body md:p-8">
      {/* Google Fonts: institutional serif for headings, technical sans for UI */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Fraunces", ui-serif, Georgia, serif;
          font-optical-sizing: auto;
        }
        .font-body {
          font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/pengguna/semak-cadangan/${id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A1F3D]/[0.08] text-[#0A1F3D] transition-colors hover:bg-[#0A1F3D]/[0.14]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E]">
            {isAlreadySubmitted ? "Tindakan" : "Draf"}
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#0A1F3D] md:text-3xl">
            {isAlreadySubmitted ? "Kemaskini Cadangan" : "Kemaskini Draf"}
          </h1>
          <p className="mt-1 text-[#64748B]">
            Ubah suai maklumat sebelum ia diproses selanjutnya.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#FDA29B] bg-[#FEF3F2] p-4 text-sm text-[#B42318] shadow-sm">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="rounded-2xl border border-[#E5E0D3] bg-white p-6 shadow-sm md:p-8">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              Kategori Cadangan <span className="text-[#B42318]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#DDD7C7] px-4 py-3 outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
            >
              <option value="">Pilih kategori...</option>
              <option value="Kompetensi pegawai">Kompetensi Pegawai</option>
              <option value="Penyampaian perkhidmatan">Penyampaian perkhidmatan</option>
              <option value="Proses kerja">Proses kerja</option>
              <option value="Polisi / Peraturan">Polisi / Peraturan</option>
              <option value="Sistem / Aplikasi">Sistem / Aplikasi</option>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="Kebajikan warga MOT">Kebajikan warga MOT</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              Tajuk Cadangan <span className="text-[#B42318]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pendigitalan Proses Kelulusan Lesen"
              className="w-full rounded-xl border border-[#DDD7C7] px-4 py-3 placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between">
              <label className="block text-sm font-semibold text-[#1F2937]">
                Penerangan / Justifikasi <span className="text-[#B42318]">*</span>
              </label>
              <span className={`text-xs font-bold ${isOverLimit ? "text-[#B42318]" : "text-[#64748B]"}`}>
                {wordCount} / 100 patah perkataan
              </span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Terangkan cadangan anda secara ringkas dan padat..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${
                isOverLimit
                  ? "border-[#B42318] focus:ring-[#B42318]"
                  : "border-[#DDD7C7] focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
              }`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              Lampiran Tambahan (Pilihan)
            </label>

            {existingFileName && !attachment && (
              <div className="mb-3 flex items-center justify-between rounded-lg border border-[#D6E1EF] bg-[#EAF0F8] p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0A1F3D]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Fail tersimpan: <span className="truncate max-w-[200px] sm:max-w-[400px]">{existingFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExistingFileName("")}
                  className="text-xs text-[#B42318] hover:underline whitespace-nowrap"
                >
                  Ganti Fail
                </button>
              </div>
            )}

            {(!existingFileName || attachment) && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                accept=".pdf,.docx,.xlsx,.jpg,.png"
                className="w-full text-sm text-[#64748B] transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-[#F2EEE4] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1F2937] hover:file:bg-[#E5E0D3]"
              />
            )}
            <p className="mt-2 text-xs text-[#94A3B8]">
              Format diterima: PDF, DOCX, XLSX, JPG, PNG (Max: 20MB). Memuat naik fail baharu akan menggantikan fail
              lama.
            </p>
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E5E0D3] pt-6 sm:flex-row">
            <Link
               href={`/pengguna/semak-cadangan/${id}`}
               className="rounded-xl bg-[#F2EEE4] px-6 py-3 text-center text-sm font-semibold text-[#475569] transition-colors hover:bg-[#E5E0D3]"
            >
              Batal
            </Link>

            {/* HANYA PAPAR JIKA STATUS MASIH DRAF */}
            {!isAlreadySubmitted && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="rounded-xl border border-[#DDD7C7] bg-white px-6 py-3 text-sm font-semibold text-[#0A1F3D] transition-colors hover:bg-[#F2EEE4] disabled:opacity-50"
              >
                Kemaskini & Kekal Draf
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting || isOverLimit}
              onClick={() => handleSubmit(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F2A4D] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>{" "}
                  Menyimpan...
                </>
              ) : isAlreadySubmitted ? (
                "Simpan Perubahan"
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