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
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
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
    <div className="relative mx-auto p-4 font-body md:p-8">
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

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08B3E]">Cadangan Baharu</p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[#0A1F3D] md:text-3xl">
          Hantar Cadangan Baharu
        </h1>
        <p className="mt-2 text-[#64748B]">Sila isi butiran cadangan anda di bawah.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-4 text-sm text-[#B42318]">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-2xl border border-[#E5E0D3] bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              Kategori <span className="text-[#B42318]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#DDD7C7] px-4 py-3 text-[#1F2937] outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Penyampaian perkhidmatan">Penyampaian Perkhidmatan</option>
              <option value="Kompetensi pegawai">Kompetensi Pegawai</option>
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
              placeholder="Masukkan tajuk ringkas"
              className="w-full rounded-lg border border-[#DDD7C7] px-4 py-3 text-[#1F2937] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between">
              <label className="block text-sm font-semibold text-[#1F2937]">
                Penerangan / Justifikasi <span className="text-[#B42318]">*</span>
              </label>
              <span className={`text-xs font-bold ${isOverLimit ? "text-[#B42318]" : "text-[#64748B]"}`}>
                {wordCount} / 100 Patah Perkataan
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Terangkan cadangan anda di sini..."
              className={`w-full rounded-lg border px-4 py-3 text-[#1F2937] outline-none transition-colors ${
                isOverLimit
                  ? "border-[#B42318] focus:ring-[#B42318]"
                  : "border-[#DDD7C7] focus:border-[#0A1F3D] focus:ring-1 focus:ring-[#0A1F3D]"
              }`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1F2937]">
              Lampiran Dokumen{" "}
              <span className="font-normal text-[#94A3B8]">(Pilihan - Maksimum 20MB)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.jpg,.png"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-[#64748B] transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-[#0A1F3D]/[0.06] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#0A1F3D] hover:file:bg-[#0A1F3D]/[0.1]"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-[#E5E0D3] pt-6 sm:flex-row sm:justify-end">
          <button
            onClick={() => triggerConfirmation(true)}
            disabled={loading || isOverLimit}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F2EEE4] disabled:opacity-50"
          >
            Simpan Sebagai Draf
          </button>
          <button
            onClick={() => triggerConfirmation(false)}
            disabled={loading || isOverLimit}
            className="rounded-lg bg-[#0A1F3D] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0F2A4D] disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Hantar Cadangan"}
          </button>
        </div>
      </div>

      {/* Pop Up Modal Pengesahan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1F3D]/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A1F3D]/[0.08]">
              <svg className="h-6 w-6 text-[#0A1F3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="font-display mb-2 text-xl font-semibold text-[#0A1F3D]">Adakah anda pasti?</h3>
            <p className="mb-6 text-sm text-[#64748B]">
              {isDraftAction
                ? "Cadangan ini akan disimpan ke dalam senarai Draf anda."
                : "Cadangan ini akan dihantar secara rasmi kepada Pejabat KSU."}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-[#475569] transition-colors hover:bg-[#F2EEE4]"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-xl bg-[#0A1F3D] px-5 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#0F2A4D]"
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