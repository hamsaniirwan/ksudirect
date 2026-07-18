"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function KemasKiniTindakan() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form State
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push(`/?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bahagian/tasks/${id}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Sesi anda mungkin telah luput atau tiada kebenaran akses. Sila log keluar dan log masuk semula.");
        }

        const result = await res.json();
        
        if (res.ok && result.status === "success") {
          setData(result.data);
          setStatus(result.data.task.status);
        } else if (res.status === 401 || res.status === 403) {
          setErrorMsg("Akses ditolak. Pastikan anda log masuk sebagai Ketua Bahagian yang berdaftar.");
        } else {
          setErrorMsg(result.message || "Gagal memuatkan data tugasan.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Ralat sistem. Tidak dapat berhubung dengan pangkalan pelayan.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router, pathname]);

  // Fungsi trigger pop-up pengesahan (bukan terus submit)
  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks) {
      setErrorMsg("Sila masukkan ulasan tindakan anda.");
      return;
    }
    setErrorMsg(""); // Kosongkan ralat
    setShowConfirmModal(true); // Tunjuk Modal
  };

  // Fungsi submit sebenar bila "Ya" ditekan
  const processSubmit = async () => {
    setShowConfirmModal(false); // Tutup Modal
    setSubmitLoading(true);
    setErrorMsg("");
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bahagian/tasks/${id}/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ status, remarks })
      });

      if (res.ok) {
        router.refresh();
        window.location.reload();
      } else {
        const result = await res.json();
        setErrorMsg(result.message || "Gagal menyimpan rekod.");
      }
    } catch (err) {
      setErrorMsg("Ralat sistem. Gagal menyimpan rekod.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuatkan data...</div>;

  if (errorMsg && !data) return (
    <div className="p-8 mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl shadow-sm text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold mb-2">Akses Dihalang</h3>
        <p className="mb-4">{errorMsg}</p>
        <button onClick={() => router.push("/")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Kembali ke Log Masuk
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const isClosed = data.task.status === "Ditutup";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 relative">
      
      {/* Bahagian Kiri: Maklumat Cadangan & Sejarah */}
      <div className="flex-1">
        <Link href="/bahagian/tugasan" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#003B73] mb-6">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Senarai
        </Link>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <span className="text-xs font-bold text-[#003B73] bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
            {data.task.reference_no}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{data.task.title}</h1>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {data.task.description}
          </p>
          
          {data.task.attachment && (
            <div className="mt-4">
              <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${data.task.attachment}`} target="_blank" className="inline-flex items-center gap-2 text-sm text-[#003B73] font-semibold hover:underline">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Lihat Lampiran Dokumen
              </a>
            </div>
          )}
        </div>

        {/* Jejak Audit */}
        <h3 className="font-bold text-slate-800 mb-4">Sejarah Tindakan</h3>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {data.audit_trails.map((trail: any) => (
            <div key={trail.id} className="border-l-2 border-blue-200 pl-4 py-1">
              <p className="text-sm font-semibold text-slate-800">{trail.action}</p>
              <p className="text-xs text-slate-500 mb-1">
                Oleh: {trail.user?.name} | {new Date(trail.created_at).toLocaleString('ms-MY')}
              </p>
              {trail.remarks && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{trail.remarks}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bahagian Kanan: Borang Tindakan */}
      <div className="lg:w-1/3">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-3">Kemas Kini Status</h3>
          
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          {isClosed ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg border border-emerald-200 text-sm font-medium text-center">
              Fail tugasan ini telah ditutup. Tiada tindakan lanjut diperlukan.
            </div>
          ) : (
            <form onSubmit={handleTriggerSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Status Baharu</label>
                <select 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-1 focus:ring-[#003B73] focus:border-[#003B73] outline-none text-slate-800 bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Telah Dipanjangkan">Belum Diproses (Baharu)</option>
                  <option value="Dalam Tindakan">Dalam Tindakan</option>
                  <option value="Selesai">Selesai / Laporan Disiapkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ulasan Tindakan <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-1 focus:ring-[#003B73] focus:border-[#003B73] outline-none text-slate-800" 
                  rows={4}
                  placeholder="Terangkan tindakan yang telah/akan diambil..."
                  value={remarks} 
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if(e.target.value) setErrorMsg(""); // Padam ralat bila user menaip
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-[#003B73] text-white font-semibold py-3 rounded-lg hover:bg-[#002f5c] transition-colors shadow-md disabled:opacity-70"
              >
                {submitLoading ? "Menyimpan..." : "Simpan Tindakan"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal Pengesahan - Adakah Anda Pasti? */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
            
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-[#003B73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Adakah anda pasti?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tindakan ini akan mengemas kini status fail cadangan dan merekodkan ulasan anda secara kekal.
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kembali
              </button>
              <button 
                onClick={processSubmit}
                className="px-5 py-2.5 bg-[#003B73] text-white font-semibold rounded-xl hover:bg-[#002f5c] shadow-md transition-colors"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}